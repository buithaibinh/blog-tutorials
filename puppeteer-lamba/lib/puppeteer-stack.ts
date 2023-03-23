import {
  Stack,
  StackProps,
  Duration,
  CfnOutput,
  RemovalPolicy
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as lambda from 'aws-cdk-lib/aws-lambda';

import * as s3 from 'aws-cdk-lib/aws-s3';

import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';

export class PuppeteerLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // create a new S3 bucket
    const bucket = new s3.Bucket(this, 'PuppeteerBucket', {
      versioned: true,
      removalPolicy: RemovalPolicy.DESTROY, // empty the bucket when the stack is deleted (for testing purposes)
      autoDeleteObjects: true, // delete all objects in the bucket when the stack is deleted (for testing purposes)
      // blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL // block public access to the bucket
    });

    // Create a new Node.js Lambda function
    const handler = new lambdaNodejs.NodejsFunction(this, 'PuppeteerLambda', {
      entry: 'functions/index.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      bundling: {
        externalModules: ['aws-sdk', 'chrome-aws-lambda'] // Add any external modules here
      },
      layers: [
        lambda.LayerVersion.fromLayerVersionArn(
          this,
          'PuppeteerLayer',
          `arn:aws:lambda:${this.region}:764866452798:layer:chrome-aws-lambda:22` // this is layer from aws_sample. Should be replaced with our own layer
        )
      ],
      timeout: Duration.seconds(30),
      memorySize: 2048,

      environment: {
        BUCKET_NAME: bucket.bucketName
      }
    });

    // grant the lambda role read/write permissions to our bucket
    bucket.grantReadWrite(handler);
    bucket.grantPutAcl(handler);

    // Log the S3 bucket name
    new CfnOutput(this, 'PuppeteerBucketName', {
      value: bucket.bucketName
    });

    // Log the Lambda function's ARN
    new CfnOutput(this, 'PuppeteerLambdaArn', {
      value: handler.functionArn
    });
  }
}
