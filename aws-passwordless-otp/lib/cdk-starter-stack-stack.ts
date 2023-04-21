import { Stack, StackProps, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { NodejsFunction, BundlingOptions } from 'aws-cdk-lib/aws-lambda-nodejs';

export class CdkStarterStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // lambda function, hooks, etc.
    const runtime: lambda.Runtime = lambda.Runtime.NODEJS_18_X;
    const logRetention: logs.RetentionDays = logs.RetentionDays.ONE_WEEK;
    const bundling: BundlingOptions = {
      minify: true,
      sourceMap: true,
      externalModules: ['aws-sdk']
    };
    // ----- Auth Configuration  -----
    const fnDefineAuthChallenge = new NodejsFunction(
      this,
      'fnDefineAuthChallenge',
      {
        entry: 'functions/src/define-auth-challenge.ts',
        handler: 'handler',
        runtime: runtime,
        logRetention: logRetention,
        bundling: bundling
      }
    );

    // ###################################################
    // CreateAuthChallenge function
    // ###################################################
    const fnCreateAuthChallenge = new NodejsFunction(
      this,
      'fnCreateAuthChallenge',
      {
        entry: 'functions/src/create-auth-challenge.ts',
        handler: 'handler',
        runtime: runtime,
        logRetention: logRetention,
        bundling: bundling,
        environment: {
          SES_FROM_ADDRESS: 'info@codewithyou.com'
        }
      }
    );

    // ###################################################
    // verifyAuthChallengeResponse function
    // ###################################################
    const fnVerifyAuthChallengeResponse = new NodejsFunction(
      this,
      'fnVerifyAuthChallengeResponse',
      {
        entry: 'functions/src/verify-auth-challenge-response.ts',
        handler: 'handler',
        runtime: runtime,
        logRetention: logRetention,
        bundling: bundling
      }
    );

    // ###################################################
    // userPool, userPoolClient, etc.
    // ###################################################
    const userPool = new cognito.UserPool(this, 'PasswordlessUserPool', {
      userPoolName: 'PasswordlessUserPool',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true
      },
      autoVerify: {
        email: true // auto verify email,
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: false,
        requireDigits: false,
        requireUppercase: false,
        requireSymbols: false
      },

      lambdaTriggers: {
        defineAuthChallenge: fnDefineAuthChallenge,
        createAuthChallenge: fnCreateAuthChallenge,
        verifyAuthChallengeResponse: fnVerifyAuthChallengeResponse
      },

      removalPolicy: RemovalPolicy.DESTROY // NOT recommended for production code
    });

    // create user pool client
    const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool,
      authFlows: {
        custom: true
      }
    });

    // ---- grant permissions to lambda functions ----
    // allow create auth challenge send mail
    fnCreateAuthChallenge.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['ses:SendEmail'],
        resources: ['*']
      })
    );

    // ---- output ----
    new CfnOutput(this, 'userPoolId', {
      value: userPool.userPoolId
    });

    new CfnOutput(this, 'userPoolClientId', {
      value: userPoolClient.userPoolClientId
    });

    // region
    new CfnOutput(this, 'region', {
      value: this.region
    });
  }
}
