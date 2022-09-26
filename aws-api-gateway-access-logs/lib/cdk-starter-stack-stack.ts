import { Stack, StackProps, CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';

export class CdkStarterStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // 1. Create a log group for our API Gateway
    const logGroup = new logs.LogGroup(this, 'ApiGatewayLogGroup', {
      logGroupName: '/aws/apigateway/cdk-starter-stack', // name of the log group.
      removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
      retention: logs.RetentionDays.ONE_MONTH, // NOT recommended for production code
    });

    // 2. Create an API Gateway REST API with a single resource and method.
    const api = new apigateway.RestApi(this, 'cdk-starter-stack-api', {
      description: 'example api gateway',
      // 👇 enable CORS. This is required for the frontend to work.
      defaultCorsPreflightOptions: {
        allowMethods: apigateway.Cors.ALL_METHODS, // this is also the default
        allowOrigins: apigateway.Cors.ALL_ORIGINS, // this is also the default
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS, // this is also the default
      },

      // 👇 enable access logging to the log group we created above.
      deployOptions: {
        stageName: 'dev',
        accessLogDestination: new apigateway.LogGroupLogDestination(logGroup), // 👈 enable access logging
        // See https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html#apigateway-cloudwatch-log-formats
        accessLogFormat: apigateway.AccessLogFormat.custom(
          '{"authorizer.claims.sub":"$context.authorizer.claims.sub","error.message":"$context.error.message","extendedRequestId":"$context.extendedRequestId","httpMethod":"$context.httpMethod","identity.sourceIp":"$context.identity.sourceIp","integration.error":"$context.integration.error","integration.integrationStatus":"$context.integration.integrationStatus","integration.latency":"$context.integration.latency","integration.requestId":"$context.integration.requestId","integration.status":"$context.integration.status","path":"$context.path","requestId":"$context.requestId","responseLatency":"$context.responseLatency","responseLength":"$context.responseLength","stage":"$context.stage","status":"$context.status"}'
        ),

        // enable execution logging
        loggingLevel: apigateway.MethodLoggingLevel.INFO, // 👈 enable execution logging
      },
    });

    // 👇 add a method to the api gateway. This is the endpoint that will be called by the client
    api.root.addMethod(
      'ANY',
      // 👇 add a mock integration. This is just for testing. You can use a lambda integration instead.
      // See https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mock-integration.html
      new apigateway.MockIntegration({
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': '{"message": "hello world from api gateway"}',
            },
          },
        ],
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        requestTemplates: {
          'application/json': '{"statusCode": 200}',
        },
      }),
      {
        methodResponses: [{ statusCode: '200' }],
      }
    );
  }
}
