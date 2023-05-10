import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as iam from 'aws-cdk-lib/aws-iam';
import * as pipelines from 'aws-cdk-lib/pipelines';
import * as s3 from 'aws-cdk-lib/aws-s3';

interface AppPipelineStackProps extends StackProps {
  sourceRepository: string;
  sourceBranch: string;
  sourceConnectionArn: string;
}

export class AppPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: AppPipelineStackProps) {
    super(scope, id, props);

    // Create a CodeBuild role with admin access
    const deployRole = new iam.Role(this, 'CodeBuildDeployRole', {
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
      managedPolicies: [
        {
          managedPolicyArn: 'arn:aws:iam::aws:policy/AdministratorAccess'
        }
      ]
    });

    // You just have to select GitHub as the source when creating the connection in the console
    // basic pipeline declaration. This sets the initial structure of our pipeline
    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      crossAccountKeys: true,
      synth: new pipelines.CodeBuildStep('SynthStep', {
        input: pipelines.CodePipelineSource.connection(
          props.sourceRepository,
          props.sourceBranch,
          {
            // Created using the AWS console. This is the ARN of the connection
            connectionArn: props.sourceConnectionArn
          }
        ),
        installCommands: [
          'n stable',
          'node --version',
          'npm i -g npm',
          'npm --version'
        ],
        commands: [
          'npm ci', // install using lock file
          'echo "CDK_VERSION=$(cdk --version)"',
          'npx cdk synth "WebserverStack"'
        ],
        role: deployRole,
        primaryOutputDirectory: './cdk.out'
      })
    });
  }
}
