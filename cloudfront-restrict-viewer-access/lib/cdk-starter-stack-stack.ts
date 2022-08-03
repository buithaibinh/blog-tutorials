import {
  Stack,
  StackProps,
  RemovalPolicy,
  Duration,
  CfnOutput,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';

import * as fs from 'fs';
export class CdkStarterStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // 1. Create a private S3 bucket
    const bucket = new s3.Bucket(this, 'MyBucket', {
      removalPolicy: RemovalPolicy.DESTROY, // DELETES the bucket when the stack is deleted
      autoDeleteObjects: true, // DELETES all objects in the bucket when the bucket is deleted
      publicReadAccess: false, // no public access, user must access via cloudfront
      blockPublicAccess: {
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true,
      },
    });

    // cloudfront public key
    const pubKey = new cloudfront.PublicKey(this, 'MyPubKey', {
      encodedKey: fs.readFileSync('./keys/public_key.pem', 'utf8'),
      comment: 'demo public key',
    });

    const keyGroup = new cloudfront.KeyGroup(this, 'MyKeyGroup', {
      items: [pubKey],
      comment: 'demo key group',
    });

    // cloudfront OAI (origin access identity)
    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, 'my-oai', {
      comment: 'demo-bucket origin access identity',
    });

    // assign get object permission to cloudfront OAI
    bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [bucket.arnForObjects('*')],
        principals: [
          new iam.CanonicalUserPrincipal(
            cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
      })
    );

    // 2. Create a CloudFront distribution
    const distribution = new cloudfront.Distribution(
      this,
      'demo-distribution',
      {
        comment: 'demo distribution',
        defaultBehavior: {
          origin: new origins.S3Origin(bucket, {
            // Restrict viewer access, viewers must use CloudFront signed URLs or signed cookies to access your content.
            originAccessIdentity: cloudfrontOAI,
          }),
          // Serving compressed files
          compress: true,
          // Allowed GET HEAD and OPTIONS requests
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
          // redirects from HTTP to HTTPS, using a CloudFront distribution,
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          // cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          cachePolicy: new cloudfront.CachePolicy(this, 'CachePolicy', {
            minTtl: Duration.seconds(0),
            defaultTtl: Duration.seconds(3600),
            maxTtl: Duration.seconds(86400),
          }),
          // Using an existing origin request policy for a Distribution
          originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
          responseHeadersPolicy: new cloudfront.ResponseHeadersPolicy(
            this,
            'ResponseHeadersPolicy',
            {
              comment: 'A default policy',
              corsBehavior: {
                accessControlAllowCredentials: false,
                accessControlAllowHeaders: ['*'],
                accessControlAllowMethods: ['GET', 'POST'],
                accessControlAllowOrigins: ['*'],
                accessControlExposeHeaders: ['*'],
                originOverride: true,
              },
            }
          ),
          trustedKeyGroups: [keyGroup],
        },
        priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
      }
    );

    // CloudFront distribution URL
    new CfnOutput(this, 's3-url', {
      value: `https://${bucket.bucketName}.s3.ap-southeast-1.amazonaws.com`,
    });

    // CloudFront distribution URL
    new CfnOutput(this, 'distribution-url', {
      value: `https://${distribution.domainName}`,
    });
  }
}
