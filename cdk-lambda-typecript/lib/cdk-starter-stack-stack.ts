import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class CdkStarterStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    // lambda function

    const testFn = new NodejsFunction(this, 'MyFunction', {
      entry: './lambda/index.ts',
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'main',
      bundling: {
        externalModules: ['aws-sdk'],
        minify: true,
      },
    });
  }
}
