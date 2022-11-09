import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import * as rds from 'aws-cdk-lib/aws-rds';
import {
  InstanceType,
  SecurityGroup,
  SubnetType,
  Vpc,
  Peer,
  Port
} from 'aws-cdk-lib/aws-ec2';
import { Aspects, CfnOutput, Duration } from 'aws-cdk-lib';
import { CfnDBCluster } from 'aws-cdk-lib/aws-rds';

export class AuroraServerlessV2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create a vpc
    const vpc = new Vpc(this, 'VPC', {
      cidr: '10.0.0.0/16',
      subnetConfiguration: [{ name: 'egress', subnetType: SubnetType.PUBLIC }], // only one subnet is needed
      natGateways: 0 // disable NAT gateways
    });

    // create a security group for aurora db
    const dbSecurityGroup = new SecurityGroup(this, 'DbSecurityGroup', {
      vpc: vpc, // use the vpc created above
      allowAllOutbound: true // allow outbound traffic to anywhere
    });

    // allow inbound traffic from anywhere to the db
    dbSecurityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(5432), // allow inbound traffic on port 5432 (postgres)
      'allow inbound traffic from anywhere to the db on port 5432'
    );

    // create a db cluster
    // https://github.com/aws/aws-cdk/issues/20197#issuecomment-1117555047
    const dbCluster = new rds.DatabaseCluster(this, 'DbCluster', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_13_6
      }),
      instances: 1,
      instanceProps: {
        vpc: vpc,
        instanceType: new InstanceType('serverless'),
        autoMinorVersionUpgrade: true,
        publiclyAccessible: true,
        securityGroups: [dbSecurityGroup],
        vpcSubnets: vpc.selectSubnets({
          subnetType: SubnetType.PUBLIC // use the public subnet created above for the db
        })
      },
      port: 5432 // use port 5432 instead of 3306
    });

    // add capacity to the db cluster to enable scaling
    Aspects.of(dbCluster).add({
      visit(node) {
        if (node instanceof CfnDBCluster) {
          node.serverlessV2ScalingConfiguration = {
            minCapacity: 0.5, // min capacity is 0.5 vCPU
            maxCapacity: 1 // max capacity is 1 vCPU (default)
          };
        }
      }
    });

    // create a lambda function
    // you can read more about lambda functions here: https://www.codewithyou.com/blog/writing-typescript-lambda-in-aws-cdk
    const fn = new NodejsFunction(this, 'Lambda', {
      entry: './lambda/index.ts',
      runtime: Runtime.NODEJS_16_X,
      handler: 'main',
      bundling: {
        externalModules: ['aws-sdk', 'pg-native'],
        minify: false
      },
      environment: {
        databaseSecretArn: dbCluster.secret?.secretArn ?? '' // pass the secret arn to the lambda function
      }
    });

    // allow the lambda function to access credentials stored in AWS Secrets Manager
    // the lambda function will be able to access the credentials for the default database in the db cluster
    dbCluster.secret?.grantRead(fn);

    // create a lambda rest api
    // you can read more about lambda rest apis here: https://www.codewithyou.com/blog/creating-a-lambda-rest-api-in-aws-cdk
    const api = new LambdaRestApi(this, 'Api', {
      handler: fn
    });

    // create a cfn output for the api url
    new CfnOutput(this, 'ApiUrl', {
      value: api.url
    });
  }
}
