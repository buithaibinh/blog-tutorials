import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import path from 'path';

export class CdkStarterStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // lambda function from docker build
    const playwrightFn = new lambda.DockerImageFunction(
      this,
      'PlaywrightFunction',
      {
        code: lambda.DockerImageCode.fromImageAsset(
          path.join(__dirname, 'functions/playwright')
        ),
        timeout: Duration.seconds(30),
        memorySize: 1024,
        architecture: lambda.Architecture.ARM_64,
      }
    );
  }
}
