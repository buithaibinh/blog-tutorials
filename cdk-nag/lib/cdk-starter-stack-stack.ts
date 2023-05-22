import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { NagSuppressions } from 'cdk-nag';

export class CdkStarterStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // suppress AwsSolutions-S1 rule
    NagSuppressions.addStackSuppressions(this, [
      {
        id: 'AwsSolutions-S1',
        reason: 'This is a test stack.'
      }
    ]);

    // Remediating AwsSolutions-S10 by enforcing SSL on the bucket.
    const bucket = new s3.Bucket(this, 'TestBucket', {
      enforceSSL: true
    });
  }
}
