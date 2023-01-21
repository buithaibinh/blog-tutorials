import { Stack, StackProps, Fn } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class WafStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // lambda function
    const testFn = new NodejsFunction(this, 'MyFunction', {
      entry: './function/index.ts',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'main',
      bundling: {
        externalModules: ['aws-sdk'],
        minify: true
      }
    });

    // api gateway, this is just for testing
    const api = new apigateway.LambdaRestApi(this, 'test-api', {
      handler: testFn,
      deployOptions: {
        stageName: 'test'
      }
    });

    // Grant api gateway invoke permission on lambda
    testFn.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));

    // web ACL. This is the main part of this snippet
    const webACL = new wafv2.CfnWebACL(this, 'webACL', {
      name: 'webACL',
      description: 'This is WebACL for Auth APi Gateway',
      scope: 'REGIONAL', // or CLOUDFRONT for CloudFront
      defaultAction: { block: {} }, // default action is block all
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: 'webACL', // metric name for CloudWatch
        sampledRequestsEnabled: true
      },
      rules: [
        // rate limit rule for IP
        {
          name: 'demo-rateLimitRule',
          priority: 20,
          action: { block: {} },
          visibilityConfig: {
            metricName: 'demo-rateLimitRule',
            cloudWatchMetricsEnabled: true,
            sampledRequestsEnabled: false
          },
          statement: {
            rateBasedStatement: {
              aggregateKeyType: 'IP',
              limit: 100
            }
          }
        },
        // allow rule for IP
        {
          name: `demo-api-auth-gateway-geolocation-rule`,
          priority: 30,
          action: { allow: {} },
          visibilityConfig: {
            metricName: `demo-AuthAPIGeoLocation`,
            cloudWatchMetricsEnabled: true,
            sampledRequestsEnabled: false
          },
          statement: {
            geoMatchStatement: {
              countryCodes: ['US', 'VN'] // allow US and VN IP
            }
          }
        },
        // SQL injection rule for all query arguments, body, and URI path
        {
          name: `demo-api-auth-gateway-sqli-rule`,
          priority: 40,
          action: { block: {} },
          visibilityConfig: {
            metricName: `demo-APIAuthGatewaySqliRule`,
            cloudWatchMetricsEnabled: true,
            sampledRequestsEnabled: false
          },
          statement: {
            orStatement: {
              statements: [
                {
                  sqliMatchStatement: {
                    fieldToMatch: {
                      allQueryArguments: {}
                    },
                    textTransformations: [
                      {
                        priority: 1,
                        type: 'URL_DECODE'
                      },
                      {
                        priority: 2,
                        type: 'HTML_ENTITY_DECODE'
                      }
                    ]
                  }
                },
                {
                  sqliMatchStatement: {
                    fieldToMatch: {
                      body: {}
                    },
                    textTransformations: [
                      {
                        priority: 1,
                        type: 'URL_DECODE'
                      },
                      {
                        priority: 2,
                        type: 'HTML_ENTITY_DECODE'
                      }
                    ]
                  }
                },
                {
                  sqliMatchStatement: {
                    fieldToMatch: {
                      uriPath: {}
                    },
                    textTransformations: [
                      {
                        priority: 1,
                        type: 'URL_DECODE'
                      }
                    ]
                  }
                }
              ]
            }
          }
        },

        // XSS rule for all query arguments and URI path
        {
          name: `demo-detect-xss`,
          priority: 60,
          action: { block: {} },
          visibilityConfig: {
            metricName: `demo-detect-xss`,
            cloudWatchMetricsEnabled: true,
            sampledRequestsEnabled: false
          },
          statement: {
            orStatement: {
              statements: [
                {
                  xssMatchStatement: {
                    fieldToMatch: {
                      uriPath: {}
                    },
                    textTransformations: [
                      {
                        priority: 1,
                        type: 'URL_DECODE'
                      },
                      {
                        priority: 2,
                        type: 'HTML_ENTITY_DECODE'
                      }
                    ]
                  }
                },
                {
                  xssMatchStatement: {
                    fieldToMatch: {
                      allQueryArguments: {}
                    },
                    textTransformations: [
                      {
                        priority: 1,
                        type: 'URL_DECODE'
                      },
                      {
                        priority: 2,
                        type: 'HTML_ENTITY_DECODE'
                      }
                    ]
                  }
                }
              ]
            }
          }
        }
      ]
    });

    // Web ACL Association
    const webACLAssociation = new wafv2.CfnWebACLAssociation(
      this,
      'webACLAssociation',
      {
        webAclArn: webACL.attrArn, // Web ACL ARN from above
        // For an Amazon API Gateway REST API: arn:aws:apigateway:region::/restapis/api-id/stages/stage-name
        resourceArn: Fn.join('', [
          'arn:aws:apigateway:', // service
          Stack.of(this).region, // region
          '::/restapis/', // resource type
          api.restApiId, // api id
          '/stages/', // resource type
          api.deploymentStage.stageName // stage name
        ])
      }
    );

    // make sure api gateway is deployed before web ACL association
    webACLAssociation.node.addDependency(api);
  }
}
