import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import dedent from 'dedent';

export class CdkStarterStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create a new REST API using the RestApi construct
    const restApi = new apigateway.RestApi(this, 'MyApi', {
      restApiName: 'My API',
      description: 'My sample API',
      deployOptions: {
        stageName: 'dev' // The default stage name is 'dev'
      }
    });

    const myLambdaFunction = new lambda.Function(this, 'MyLambdaFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(
        dedent(`
        exports.handler = async (event) => {
          console.log('event: ', event)
          return {
            statusCode: 200,
            body: JSON.stringify(event),
          };
         };
      `)
      )
    });

    // Define a resource and method for your API using the addResource and addMethod methods.
    const getMethod = restApi.root.addResource('resource').addResource('{id}');

    // Define the request parameters you want to validate using the requestParameters property.
    getMethod.addMethod(
      'GET',
      new apigateway.LambdaIntegration(myLambdaFunction),
      {
        // For example, to require a path parameter called id and a query parameter called name, set the requestParameters property like this:
        requestParameters: {
          'method.request.path.id': true,
          'method.request.querystring.name': true
        },

        // Enable request validation for the method by setting the requestValidatorOptions.validateRequestParameters property to true.
        // This will validate the request parameters against the requestParameters property.
        requestValidatorOptions: {
          validateRequestParameters: true
        }
      }
    );
  }
}
