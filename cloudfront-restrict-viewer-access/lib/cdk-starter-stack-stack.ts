import {
  Stack,
  StackProps,
  RemovalPolicy,
  Duration,
  CfnOutput,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';

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
      encodedKey: `-----BEGIN PUBLIC KEY-----
      MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0jZYspNP7h9cPpjbvcD1
      4QkYAybuO9VBmyh5GgJY/WMuw5izWmkMGVIOUf6SL/qu/YGGFw07BI/oytRcKknx
      iCRWASq8BkMAXn/9rWQkFN0i9p4WB/iviS2Jez8T6ML8NvYd963bvm60I+W0ciEO
      tUiBGJlgIajVisLyboFMZMvGubWAsZ/uoRYvbG73rdr4pCayhJGYrO4LfUgpzBwP
      EIxywq536wdNv2eEPs2B1Frq6Mjr6mV4G0x++srb+pv4vIQ2Brpwf26eFaYGFILb
      ETvzM+nGQErRzstH5it3hk2OSay/pF/QVlzKt0GqzLB0tHZJLbpKcCYN6si7NUgK
      2QIDAQAB
      -----END PUBLIC KEY-----`,
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
