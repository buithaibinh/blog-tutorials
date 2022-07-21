import { Stack, StackProps, RemovalPolicy, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as iam from "aws-cdk-lib/aws-iam";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";

/**
 * Serving compressed files with cloudfront
 */
export class CdkStarterStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // content bucket
    const bucket = new s3.Bucket(this, "demo-bucket", {
      publicReadAccess: false, // no public access, user must access via cloudfront
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,

      /**
       * The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
       * the new bucket, and it will remain in your account until manually deleted. By setting the policy to
       * DESTROY, cdk destroy will attempt to delete the bucket, but will error if the bucket is not empty.
       */
      removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code

      /**
       * For sample purposes only, if you create an S3 bucket then populate it, stack destruction fails.  This
       * setting will enable full cleanup of the demo.
       */
      autoDeleteObjects: true, // NOT recommended for production code
    });

    // cloudfront OAI (origin access identity)
    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, "my-oai", {
      comment: "demo-bucket origin access identity",
    });

    // assign get object permission to cloudfront OAI
    bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [bucket.arnForObjects("*")],
        principals: [
          new iam.CanonicalUserPrincipal(
            cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
      })
    );

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, "my-distribution", {
      comment: "demo-bucket distribution",
      defaultBehavior: {
        origin: new origins.S3Origin(bucket, {
          // Restrict viewer access, viewers must use CloudFront signed URLs or signed cookies to access your content.
          originAccessIdentity: cloudfrontOAI,
        }),
        // Serving compressed files
        compress: true,
        // Allowed GET HEAD and OPTIONS requests
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        // redirects from HTTP to HTTPS, using a CloudFront distribution,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });

    // s3 bucket name
    new CfnOutput(this, "bucket-name", {
      value: bucket.bucketName,
    });

    // CloudFront distribution ID
    new CfnOutput(this, "distribution-id", {
      value: distribution.distributionId,
    });

    // CloudFront distribution URL
    new CfnOutput(this, "distribution-url", {
      value: `https://${distribution.domainName}`,
    });
  }
}
