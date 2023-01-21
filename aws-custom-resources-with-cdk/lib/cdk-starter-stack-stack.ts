import { Stack, StackProps, RemovalPolicy, CustomResource } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId
} from 'aws-cdk-lib/custom-resources';

export class CdkStarterStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // create a user pool
    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'my-user-pool',
      selfSignUpEnabled: true,
      standardAttributes: {
        email: {
          required: true,
          mutable: true
        }
      },
      removalPolicy: RemovalPolicy.DESTROY //  for demo purposes only, not recommended for production
    });

    // Create the user inside the Cognito user pool using Lambda backed AWS Custom resource
    const userName = 'buithaibinh@gmai.com';
    const password = 'Password123!';
    const adminCreateOrDeleteUser = new AwsCustomResource(
      this,
      'CreateUserCustomResource',
      {
        // The AWS SDK calls to be made when this resource is initially created
        onCreate: {
          service: 'CognitoIdentityServiceProvider',
          action: 'adminCreateUser',
          parameters: {
            UserPoolId: userPool.userPoolId,
            Username: userName,
            MessageAction: 'SUPPRESS', // don't send a welcome email
            TemporaryPassword: password
          },
          physicalResourceId: PhysicalResourceId.of(
            `AwsCustomResource-CreateUser-${userName}`
          ) // this is required to avoid duplicate resource creation
        },

        policy: AwsCustomResourcePolicy.fromSdkCalls({
          resources: AwsCustomResourcePolicy.ANY_RESOURCE
        }),
        installLatestAwsSdk: true
      }
    );

    // after the user is created, they are in FORCE_PASSWORD_CHANGE status
    // so we need to change the password. For demo purposes, we are using a lambda function to do this
    const fn = new NodejsFunction(this, 'SetUserPasswordFunction', {
      runtime: lambda.Runtime.NODEJS_18_X, // we use node 18 for aws-sdk v3 support
      handler: 'onEvent',
      entry: 'lambda/index.ts',
      bundling: {
        externalModules: [
          // exclude aws sdk v3 from the bundle
          'aws-sdk'
        ],
        minify: false
      }
    });

    // Create a Admin group
    const adminGroup = new cognito.CfnUserPoolGroup(this, 'AdminGroup', {
      groupName: 'Admin',
      userPoolId: userPool.userPoolId
    });

    // attach the user to the Admin group
    const userToAdminsGroupAttachment =
      new cognito.CfnUserPoolUserToGroupAttachment(
        this,
        'userToAdminsGroupAttachment',
        {
          groupName: adminGroup.groupName!,
          username: userName,
          userPoolId: userPool.userPoolId
        }
      );

    // make sure the user is created before adding to the group
    userToAdminsGroupAttachment.node.addDependency(adminCreateOrDeleteUser);
    userToAdminsGroupAttachment.node.addDependency(userPool);
  }
}
