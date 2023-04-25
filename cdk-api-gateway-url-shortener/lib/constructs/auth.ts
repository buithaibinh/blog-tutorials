import { StackProps, Duration, CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export interface AuthServiceProps extends StackProps {}

export class AuthService extends Construct {
  constructor(scope: Construct, id: string, props: AuthServiceProps) {
    super(scope, id);

    const userPool = new cognito.UserPool(this, 'UserPool', {
      selfSignUpEnabled: true,
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      userPoolName: `${id.toLowerCase()}-pool`,
      passwordPolicy: {
        minLength: 8,
        requireLowercase: false,
        requireDigits: false,
        requireUppercase: false,
        requireSymbols: false
      },
      signInAliases: {
        email: true
      },
      autoVerify: {
        email: true
      },
      standardAttributes: {
        email: {
          required: true
        }
      },
      removalPolicy: RemovalPolicy.DESTROY
    });

    userPool.addDomain('UserPoolDomain', {
      cognitoDomain: {
        domainPrefix: `${id.toLowerCase()}-domain`
      }
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool,
      userPoolClientName: `${id.toLowerCase()}-client`,
      supportedIdentityProviders: [cognito.UserPoolClientIdentityProvider.COGNITO],
      oAuth: {
        flows: {
          authorizationCodeGrant: true
        },
        scopes: [cognito.OAuthScope.EMAIL, cognito.OAuthScope.OPENID],
        callbackUrls: ['http://localhost:3000'],
        logoutUrls: ['http://localhost:3000']
      }
    });

    // output the user pool id and client id
    new CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId
    });

    new CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId
    });
  }
}
