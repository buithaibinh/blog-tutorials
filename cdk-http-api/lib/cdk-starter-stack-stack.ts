import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';

import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from '@aws-cdk/aws-apigatewayv2-alpha';
import * as apiGatewayIntegrations from '@aws-cdk/aws-apigatewayv2-integrations-alpha';

export class CdkStarterStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // http api
    const api = new HttpApi(this, 'HttpApi', {
      description: 'sample http api',
      corsPreflight: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
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
      path: '/api',
      methods: [HttpMethod.GET],
      integration: new apiGatewayIntegrations.HttpLambdaIntegration(
        'fn-integration',
        fn,
        {}
      ),
    });

    // output api url
    new CfnOutput(this, 'ApiUrl', {
      value: `${api.apiEndpoint}/api`,
    })
  }
}
