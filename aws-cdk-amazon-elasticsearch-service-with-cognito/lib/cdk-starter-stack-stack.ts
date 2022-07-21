import {
  Stack,
  StackProps,
  CfnParameter,
  RemovalPolicy,
  Fn,
  CfnOutput,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as opensearch from 'aws-cdk-lib/aws-opensearchservice';

export class CdkStarterStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const applicationPrefix = new CfnParameter(this, 'applicationPrefix', {
      description:
        'Prefix for the Amazon Cognito domain and the Amazon Elasticsearch Service domain',
      type: 'String',
      allowedPattern: '^[a-z0-9]*$',
      minLength: 3,
      maxLength: 20,
    }).valueAsString;

    // get a unique suffix from the last element of the stackId, e.g. 06b321d6b6e2
    const suffix = Fn.select(
      4,
      Fn.split('-', Fn.select(2, Fn.split('/', this.stackId)))
    );

    // domain arn for the Amazon Elasticsearch Service
    const domainArn =
      'arn:aws:es:' +
      this.region +
      ':' +
      this.account +
      ':domain/' +
      applicationPrefix +
      '/*';

    // cognito user pool
    const userPool = new cognito.UserPool(this, 'UserPool', {
      selfSignUpEnabled: false,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: false,
        requireUppercase: false,
        requireDigits: false,
        requireSymbols: false,
      },
    });

    // cognito user pool domain
    new cognito.UserPoolDomain(this, 'UserPoolDomain', {
      userPool,
      cognitoDomain: {
        domainPrefix: `${applicationPrefix}-${suffix}`,
      },
    });

    // cognito user pool identity pool
    const idPool = new cognito.CfnIdentityPool(this, 'IdentityPool', {
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [],
    });

    const esAdminUserRole = new iam.Role(this, 'esAdminUserRole', {
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: { 'cognito-identity.amazonaws.com:aud': idPool.ref },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
    });

    // Attach roles to Identity Pool
    new cognito.CfnIdentityPoolRoleAttachment(
      this,
      'IdentityPoolRoleAttachment',
      {
        identityPoolId: idPool.ref,
        roles: {
          authenticated: esAdminUserRole.roleArn,
        },
      }
    );

    const elasticsearchHttpPolicy = new iam.ManagedPolicy(
      this,
      'elasticsearchHttpPolicy',
      {
        roles: [esAdminUserRole],
      }
    );

    // allow the elasticsearch http policy full access to the domain
    elasticsearchHttpPolicy.addStatements(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: [domainArn],
        actions: ['es:*'],
      })
    );

    // Policy that grants Amazon OpenSearch Service the access to your Cognito resources.
    const esRole = new iam.Role(this, 'esRole', {
      assumedBy: new iam.ServicePrincipal('es.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonESCognitoAccess'),
      ],
    });

    // elasticsearch domain
    const esDomain = new opensearch.Domain(this, 'OpenSearch', {
      version: opensearch.EngineVersion.ELASTICSEARCH_7_10,
      domainName: applicationPrefix,
      enableVersionUpgrade: true,
      removalPolicy: RemovalPolicy.DESTROY,
      capacity: {
        dataNodes: 1,
        dataNodeInstanceType: 't3.small.search',
      },
      encryptionAtRest: {
        enabled: true,
      },
      nodeToNodeEncryption: true,
      enforceHttps: true,

      ebs: {
        volumeSize: 10,
        volumeType: ec2.EbsDeviceVolumeType.GP2,
      },

      cognitoDashboardsAuth: {
        identityPoolId: idPool.ref,
        userPoolId: userPool.userPoolId,
        role: esRole,
      },
    });

    new CfnOutput(this, 'createUserUrl', {
      description:
        'Create a new user in the user pool here - add it to the es-admins group if fine grained access controls should not apply.',
      value:
        'https://' +
        this.region +
        '.console.aws.amazon.com/cognito/users?region=' +
        this.region +
        '#/pool/' +
        userPool.userPoolId +
        '/users',
    });

    new CfnOutput(this, 'kibanaUrl', {
      description: 'Access Kibana via this URL.',
      value: 'https://' + esDomain.domainName + '/_plugin/kibana/',
    });
  }
}
