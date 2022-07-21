import { StackProps, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface AuthServiceProps extends StackProps {
  userPoolId?: string;
}
export class AuthService extends Construct {
  readonly userPool: cognito.IUserPool;
  readonly userPoolClients: cognito.IUserPoolClient[];
  readonly authRole: iam.Role;
  readonly unAuthRole: iam.Role;

  constructor(scope: Construct, id: string, props: AuthServiceProps) {
    super(scope, id);

    const userPool: cognito.IUserPool = props.userPoolId
      ? cognito.UserPool.fromUserPoolId(this, 'UserPool', props.userPoolId)
      : new cognito.UserPool(this, 'UserPool', {
          selfSignUpEnabled: true,
          signInAliases: {
            email: true,
          },
          standardAttributes: {
            email: { required: true, mutable: true },
          },
          autoVerify: {
            email: true,
          },
          passwordPolicy: {
            minLength: 8,
            requireLowercase: false,
            requireDigits: false,
            requireUppercase: false,
            requireSymbols: false,
          },

          accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
          removalPolicy: RemovalPolicy.DESTROY,
        });

    // client
    const client = new cognito.UserPoolClient(this, 'WebClient', {
      userPool,
      userPoolClientName: 'WebClient',
      generateSecret: false,
      preventUserExistenceErrors: true,
    });
    this.userPoolClients = [client];

    // cognito identity providers
    const identityPool = new cognito.CfnIdentityPool(
      this,
      'CognitoIdentityProvider',
      {
        allowUnauthenticatedIdentities: true,
        cognitoIdentityProviders: [
          {
            clientId: client.userPoolClientId,
            providerName: (userPool as cognito.UserPool).userPoolProviderName,
          },
        ],
      }
    );

    // create some roles.
    const iamUnAuthRole = this.createUnAuthRole(identityPool);
    const iamAuthRole = this.createAuthRole(identityPool);
    this.authRole = iamAuthRole;
    this.unAuthRole = iamUnAuthRole;

    // Attach roles to Identity Pool
    new cognito.CfnIdentityPoolRoleAttachment(
      this,
      'IdentityPoolRoleAttachment',
      {
        identityPoolId: identityPool.ref,
        roles: {
          unauthenticated: iamUnAuthRole.roleArn,
          authenticated: iamAuthRole.roleArn,
        },
      }
    );

    this.userPool = userPool;

    // outputs
    new CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
    });
    new CfnOutput(this, 'UserPoolClientId', {
      value: client.userPoolClientId,
    });
    new CfnOutput(this, 'IdentityPoolId', {
      value: identityPool.ref,
    });
  }

  private createUnAuthRole(identityPool: cognito.CfnIdentityPool): iam.Role {
    const role = new iam.Role(this, 'IdentityPoolUnAuthRole', {
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': identityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'unauthenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
    });

    role.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['mobileanalytics:PutEvents', 'cognito-sync:*'],
        resources: ['*'],
      })
    );

    return role;
  }

  /**
   * user authored role
   * @param identityPool
   * @returns
   */
  private createAuthRole(
    identityPool: cognito.CfnIdentityPool,
    roleName = 'IdentityPoolAuthRole'
  ): iam.Role {
    const role = new iam.Role(this, roleName, {
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': identityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
    });

    role.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'mobileanalytics:PutEvents',
          'cognito-sync:*',
          'cognito-identity:*',
        ],
        resources: ['*'],
      })
    );
    return role;
  }
}
