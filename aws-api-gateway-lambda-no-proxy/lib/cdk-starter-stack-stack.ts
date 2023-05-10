import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export class CdkStarterStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const restApi = new apigateway.RestApi(this, 'RestApiNonProxy', {
      restApiName: 'RestApiNonProxy',
      deployOptions: {
        stageName: 'dev'
      }
    });

    const fn = new NodejsFunction(this, 'SampleFn', {
      entry: path.join(__dirname, 'lambda', 'index.mjs'),
      handler: 'handler'
    });

    const integration = new apigateway.Integration({
      integrationHttpMethod: 'POST',
      type: apigateway.IntegrationType.AWS,
      uri: `arn:aws:apigateway:${this.region}:lambda:path/2015-03-31/functions/${fn.functionArn}/invocations`,
      options: {
        credentialsRole: fn.role,
        requestParameters: {
        },
        requestTemplates: {
          'application/json': `
            {
              "greeter": "$util.escapeJavaScript($input.params('greeter'))"
            }
          `
        },
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': `
                {
                  "message": "Hello, \$input.params('greeter')"
                }
              `,
            }
          }
        ]
      }
    });

    const resource = restApi.root.addResource('hello');
    resource.addMethod('GET', integration, {
      methodResponses: [
        {
          statusCode: '200'
        },
      ]
    });
  }
}
