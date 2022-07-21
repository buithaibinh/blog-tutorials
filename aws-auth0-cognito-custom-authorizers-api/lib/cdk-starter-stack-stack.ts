import { CfnOutput, Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apiGatewayAuthorizers from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import * as apiGatewayIntegrations from '@aws-cdk/aws-apigatewayv2-integrations-alpha';

export class CdkStarterStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create a http API Gateway
    const httpApi = new apiGateway.HttpApi(this, 'HttpApi', {
      apiName: 'aws-auth0-cognito-custom-authorizers-api',
    });

    // public endpoint for the API
    const publicFn = new lambda.Function(this, 'PublicFn', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'handler.publicEndpoint',
      code: lambda.Code.fromAsset('./functions'),
    });
    httpApi.addRoutes({
      methods: [apiGateway.HttpMethod.GET],
      integration: new apiGatewayIntegrations.HttpLambdaIntegration(
        'public-integration',
        publicFn
      ),
      path: '/public',
    });

    // ---- protected endpoint for the API
    // Create a lambda authorizer for the API
    const authorizerFn = new lambda.Function(this, 'Authorizer', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'auth.authorize',
      code: lambda.Code.fromAsset('./functions'),
      environment: {
        // For Auth0:       https://<project>.auth0.com/
        // refer to:        https://auth0.com/docs/secure/tokens/id-tokens
        // For AWS Cognito: https://cognito-idp.<region>.amazonaws.com/<user pool id>
        // refer to:        https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html
        IIS_URL: 'https://<url>.com',
      },
    });

    // Create a custom authorizer for the API
    const authorizer = new apiGatewayAuthorizers.HttpLambdaAuthorizer(
      'authorizer-lambda',
      authorizerFn,
      {
        identitySource: ['$request.header.Authorization'],
      }
    );

    const privateFn = new lambda.Function(this, 'PrivateFn', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'handler.privateEndpoint',
      code: lambda.Code.fromAsset('./functions'),
    });
    httpApi.addRoutes({
      methods: [apiGateway.HttpMethod.GET],
      integration: new apiGatewayIntegrations.HttpLambdaIntegration(
        'private-integration',
        privateFn
      ),
      path: '/private',
      authorizer,
    });

    new CfnOutput(this, 'HttpApiUrl', {
      value: httpApi.apiEndpoint,
    });
  }
}
