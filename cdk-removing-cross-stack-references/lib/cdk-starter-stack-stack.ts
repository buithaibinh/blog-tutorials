import { Stack, StackProps, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';

interface Stack2Props extends StackProps {
  // reference to the bucket from stack1
  bucket: s3.Bucket;
}

export class Stack1 extends Stack {
  readonly bucket: s3.Bucket;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Let's say there is a Bucket in the stack1, and the stack2 references its bucket.bucketName.
    const bucket = new s3.Bucket(this, 'bucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    this.bucket = bucket;

    // Uncomment the following line
    // This will make sure the CloudFormation Export continues to exist while the relationship between the two stacks is being broken.
    // this.exportValue(bucket.bucketName);
  }
}

export class Stack2 extends Stack {
  constructor(scope: Construct, id: string, props: Stack2Props) {
    super(scope, id, props);

    // comment out the following line and re-deploy to see the error
    //  ❌  Stack1 failed: Error: The stack named Stack1 failed to deploy: UPDATE_ROLLBACK_COMPLETE
    new CfnOutput(this, 'bucketName', {
      value: props.bucket.bucketName,
    });
  }
}
