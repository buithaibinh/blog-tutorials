import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  CorsHttpMethod,
  HttpApi,
  HttpRouteIntegration,
  HttpMethod,
} from '@aws-cdk/aws-apigatewayv2-alpha';
import * as apiGatewayAuthorizers from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import * as apiGatewayIntegrations from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import { AuthService } from './auth-service';

export class CdkStarterStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // create a auth service, this will create a user pool and user pool client
    // it also creates 2 roles, one for unauthenticated and one for authenticated
    // the roles will be used to create the authorizer and the integration
    const auth = new AuthService(this, 'AuthService', {});

    // ==== HTTP API ====
    const api = new HttpApi(this, 'HttpApi', {
      description: 'This is a sample HTTP API',
      corsPreflight: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
        allowMethods: [
          CorsHttpMethod.OPTIONS,
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.PUT,
          CorsHttpMethod.PATCH,
          CorsHttpMethod.DELETE,
        ],
        allowCredentials: true,
        allowOrigins: ['http://localhost:8080'],
      },
    });
    // add http iam authorizer
    const authorizer = new apiGatewayAuthorizers.HttpIamAuthorizer();

    // lambda function
    const fn = new NodejsFunction(this, 'SampleFunction', {
      entry: './lambda/index.ts',
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'main',
      architecture: lambda.Architecture.ARM_64,
      logRetention: logs.RetentionDays.ONE_WEEK,
      bundling: {
        externalModules: ['aws-sdk'],
        minify: true,
      },
    });

    // add route with lambda integration
    api.addRoutes({
      path: '/api/test',
      methods: [HttpMethod.GET],
      integration: new apiGatewayIntegrations.HttpLambdaIntegration(
        'fn-integration',
        fn,
        {}
      ),
      authorizer, // use IAM authorizer
    });

    // allow unauthenticated access to the API
    // This is very important for the API to work
    auth.unAuthRole.attachInlinePolicy(
      new iam.Policy(this, 'UnAuthPolicy', {
        statements: [
          new iam.PolicyStatement({
            actions: ['execute-api:*'],
            resources: [
              // allow unauthenticated access to the API /api
              // arn:aws:execute-api:region:account-id:api-id/stage/METHOD_HTTP_VERB/Resource-path
              `arn:aws:execute-api:${Stack.of(this).region}:*:*/*/*/api/*`,
            ],
          }),
        ],
      })
    );

    // output api url
    new CfnOutput(this, 'ApiUrl', {
      value: `${api.apiEndpoint}/api/test`,
    });
  }
}
