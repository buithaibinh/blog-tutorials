import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  RestApi,
  MockIntegration,
  Model,
  LambdaIntegration,
} from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import * as lambda from 'aws-cdk-lib/aws-lambda';

export class CdkStarterStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // create a new Rest API
    const api = new RestApi(this, 'ApiGateway', {
      restApiName: 'ApiGateway',
      description: 'ApiGateway',
    });

    // 👇 add a resource with GET method for demo purposes
    const routes = api.root.addResource('demo', {});
    // mock response
    routes.addMethod(
      'GET',
      new MockIntegration({
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': '{"message": "Hello World!"}',
            },
            responseParameters: {
              // 👇 allow CORS for all origins
              'method.response.header.Access-Control-Allow-Origin': "'*'",
              'method.response.header.Access-Control-Allow-Headers':
                "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
              'method.response.header.Access-Control-Allow-Credentials':
                "'true'",
              'method.response.header.Access-Control-Allow-Methods':
                "'OPTIONS,GET,PUT,POST,DELETE'",
            },
          },
        ],
        requestTemplates: {
          'application/json': '{"statusCode": 200}',
        },
      }),

      {
        methodResponses: [
          {
            statusCode: '200',
            responseModels: {
              'application/json': Model.EMPTY_MODEL,
            },
            responseParameters: {
              // 👇 allow CORS for all origins
              'method.response.header.Access-Control-Allow-Origin': true,
              'method.response.header.Access-Control-Allow-Headers': true,
              'method.response.header.Access-Control-Allow-Credentials': true,
              'method.response.header.Access-Control-Allow-Methods': true,
            },
          },
        ],
      }
    );

    // lambda function
    const testFn = new NodejsFunction(this, 'MyFunction', {
      entry: './function/index.ts',
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'main',
      bundling: {
        externalModules: ['aws-sdk'],
        minify: true,
      },
    });

    // 👇 add a resource with GET method for demo purposes
    api.root
      .addResource('lambda', {})
      .addMethod('GET', new LambdaIntegration(testFn));
  }
}
