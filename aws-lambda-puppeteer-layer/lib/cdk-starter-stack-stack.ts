import { Stack, StackProps, RemovalPolicy, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';

import * as path from 'path';

export class CdkStarterStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // create a new S3 bucket
    const bucket = new s3.Bucket(this, 'ExtractorStackBucket', {
      versioned: false,
      removalPolicy: RemovalPolicy.DESTROY, // empty the bucket when the stack is deleted (for testing purposes)
      autoDeleteObjects: true, // delete all objects in the bucket when the stack is deleted (for testing purposes)
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL // block public access to the bucket
    });

    const puppeteerLayer = new lambda.LayerVersion(this, 'PuppeteerLayer', {
      code: lambda.Code.fromAsset(
        path.join(__dirname, 'layers/chrome-aws-lambda-v10.4.0.zip')
      ),
      // because the zip file is compiled specifically for AWS Lambda (Linux x64)
      // it is not compatible with other runtimes or architectures
      compatibleRuntimes: [lambda.Runtime.NODEJS_14_X],
      compatibleArchitectures: [lambda.Architecture.X86_64],
      description: 'Puppeteer layer v10.4.0',
      removalPolicy: RemovalPolicy.DESTROY // not recommended for production code
    });

    // Create a new Node.js Lambda function
    const handler = new lambdaNodejs.NodejsFunction(
      this,
      'PuppeteerLayerDemoFn',
      {
        entry: path.join(__dirname, 'lambda/index.mjs'),
        handler: 'handler',
        runtime: lambda.Runtime.NODEJS_14_X,
        bundling: {
          externalModules: [
            'aws-sdk',
            'chrome-aws-lambda' // exclude chrome-aws-lambda from the bundle, it will be provided by the layer
          ]
        },
        timeout: Duration.seconds(30),
        architecture: lambda.Architecture.X86_64,
        memorySize: 2048,
        environment: {
          BUCKET_NAME: bucket.bucketName
        },
        layers: [puppeteerLayer],
        logRetention: logs.RetentionDays.ONE_WEEK
      }
    );

    // grant the lambda role read/write permissions to our bucket
    bucket.grantReadWrite(handler);
  }
}
