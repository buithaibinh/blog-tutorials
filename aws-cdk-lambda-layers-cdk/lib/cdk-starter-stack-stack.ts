import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class CdkStarterStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    console.log('Hello from CDK!');
    // The code that defines your stack goes here

    const sharpLayer = new lambda.LayerVersion(this, 'sharp-layer', {
      compatibleRuntimes: [
        lambda.Runtime.NODEJS_12_X,
        lambda.Runtime.NODEJS_14_X,
        lambda.Runtime.NODEJS_16_X,
      ],
      code: lambda.Code.fromAsset('./src/layers/sharp-layer'),
      description: 'Uses a 3rd party library called sharp',
    });

    new NodejsFunction(this, 'my-function', {
      memorySize: 1024,
      timeout: Duration.seconds(5),
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'main',
      entry: './src/lambda/index.ts',
      bundling: {
        minify: false,
        // 👇 don't bundle `sharp` layer
        // layers are already available in the lambda env
        externalModules: ['aws-sdk', 'sharp'],
      },
      layers: [sharpLayer],
    });
  }
}
