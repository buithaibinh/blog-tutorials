import { Stack, StackProps, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { UserPool } from 'aws-cdk-lib/aws-cognito';

import {
  IdentityPool,
  UserPoolAuthenticationProvider
} from '@aws-cdk/aws-cognito-identitypool-alpha';

import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';

export class CdkStarterStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // create a new user pool for the app
    const userPool = new UserPool(this, 'UserPool', {});

    // create a identity pool for the app
    const identityPool = new IdentityPool(this, 'IdentityPool', {
      identityPoolName: 'IdentityPool',
      allowUnauthenticatedIdentities: true, // allow unauthenticated users,
      authenticationProviders: {
        userPools: [
          new UserPoolAuthenticationProvider({
            userPool
          })
        ]
      }
    });

    // create a bucket for the app. This is where the user's photos will be stored
    const bucket = new s3.Bucket(this, 'Bucket', {
      removalPolicy: RemovalPolicy.DESTROY, // not recommended for production code
      autoDeleteObjects: true // delete all objects in the bucket when the bucket is deleted. not recommended for production code
    });

    // By default, both the authenticated and unauthenticated roles will have no permissions attached.
    // Grant permissions to roles using the public authenticatedRole and unauthenticatedRole properties:
    // bucket.grantReadWrite(identityPool.authenticatedRole);
    // bucket.grantRead(identityPool.unauthenticatedRole);

    // add policy statements straight to the role
    // identityPool.authenticatedRole.addToPrincipalPolicy(
    //   new iam.PolicyStatement({
    //     effect: iam.Effect.ALLOW,
    //     actions: ['s3:PutObject', 's3:GetObject', 's3:DeleteObject'],
    //     resources: [
    //       bucket.bucketArn + '/private/${cognito-identity.amazonaws.com:sub}/*'
    //     ]
    //   })
    // );

    // output the user pool id
    new CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId
    });

    // output the identity pool id
    new CfnOutput(this, 'IdentityPoolId', {
      value: identityPool.identityPoolId
    });

    // output the bucket name
    new CfnOutput(this, 'BucketName', {
      value: bucket.bucketName
    });
  }
}
