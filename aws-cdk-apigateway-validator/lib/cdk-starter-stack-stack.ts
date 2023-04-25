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
    const resource = restApi.root.addResource('resource');

    // Define the request body schema using the requestModels property.
    // For example, to require a JSON request body with a name field, set the requestModels property like this:
    const requestBodySchema = new apigateway.Model(this, 'RequestBodySchema', {
      restApi: restApi,
      contentType: 'application/json',
      schema: {
        type: apigateway.JsonSchemaType.OBJECT,
        properties: {
          name: { type: apigateway.JsonSchemaType.STRING }
        },
        required: ['name']
      }
    });

    const bodyValidator = new apigateway.RequestValidator(
      this,
      'BodyValidator',
      {
        restApi: restApi,
        requestValidatorName: 'BodyValidator',
        validateRequestBody: true,
        validateRequestParameters: false
      }
    );

    resource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(myLambdaFunction),
      {
        // Enable request validation for the method by setting the requestValidatorOptions.validateRequestBody property to true.
        // This will validate the request body against the requestBody property.
        requestValidator: bodyValidator,
        requestModels: {
          'application/json': requestBodySchema
        }
      }
    );

    const getMethod = resource.addResource('{id}');
    const queryStringValidator = new apigateway.RequestValidator(
      this,
      'RequestValidator',
      {
        restApi: restApi,
        requestValidatorName: 'RequestValidator',
        validateRequestBody: false,
        validateRequestParameters: true
      }
    );
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
        requestValidator: queryStringValidator
      }
    );
  }
}
