import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as path from 'path';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class CdkStarterStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const s3Bucket = new s3.Bucket(this, 's3Bucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    const api = new apigateway.RestApi(
      this,
      'aws-api-gateway-return-binary-lambda-proxy',
      {
        restApiName: 'aws-api-gateway-return-binary-lambda-proxy',
        description: 'Return binary data from Lambda via API Gateway',
        binaryMediaTypes: ['*/*'] // allow all binary types to be returned
      }
    );

    const fn = new NodejsFunction(this, 'lambda', {
      entry: path.join(__dirname, 'lambda', 'index.mjs'),
      handler: 'handler',
      environment: {
        BUCKET_NAME: s3Bucket.bucketName
      },
      bundling: {
        externalModules: ['aws-sdk'] // exclude aws-sdk from the bundle
      }
    });
    s3Bucket.grantRead(fn);

    const integration = new apigateway.LambdaIntegration(fn, {
      proxy: true
    });

    api.root.addMethod('GET', integration);
  }
}
