import { Stack, StackProps, CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

import * as cloud9 from 'aws-cdk-lib/aws-cloud9';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class CdkStarterStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // use default VPC
    const defaultVpc = ec2.Vpc.fromLookup(this, 'DefaultVPC', {
      isDefault: true
    });

    // you should create a new user and use that user's ARN
    // you can use the following command to get the ARN of the user
    // aws iam get-user --user-name <user-name> --query 'User.Arn'
    const ownerArn = `arn:aws:iam::${
      this.account
    }:user/${this.node.tryGetContext('user')}`;

    //  create a new Cloud9 environment.
    const c9env = new cloud9.CfnEnvironmentEC2(this, 'C9Env', {
      name: 'c9env',
      description: 'Cloud9 Environment',
      automaticStopTimeMinutes: 15, // stop the environment after 15 minutes of inactivity
      instanceType: 't2.micro',
      ownerArn, // if you don't specify this, the environment will create a new user for you
      connectionType: 'CONNECT_SSM', // use SSM to connect to the environment. You can also use SSH
      subnetId: defaultVpc.selectSubnets({
        subnetType: ec2.SubnetType.PUBLIC
      }).subnetIds[0] // use the first public subnet
    });

    const environmentId = c9env.ref;
    const ideUrl = `https://${this.region}.console.aws.amazon.com/cloud9/ide/${environmentId}`;

    new CfnOutput(this, 'Cloud9IDEUrl', {
      value: ideUrl
    });
  }
}
