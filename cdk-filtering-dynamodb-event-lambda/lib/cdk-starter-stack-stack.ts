import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class CdkStarterStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // 1. Create a DynamoDB table
    const dynamoTable = new dynamodb.Table(this, 'DynamoTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    // 2. Create a Lambda function that will be triggered by the DynamoDB stream
    // you can see how to create lambda functions in typescript in the following link:
    // https://www.codewithyou.com/blog/writing-typescript-lambda-in-aws-cdk
    const fn = new NodejsFunction(this, 'Handler', {
      entry: './lambda/index.ts',
      handler: 'main',
      runtime: lambda.Runtime.NODEJS_14_X,
      architecture: lambda.Architecture.ARM_64,
      bundling: {
        externalModules: ['aws_sdk'],
        minify: true,
      },
    });

    // 3. currently, aws cdk is not yet support filtering event sources
    // https://github.com/aws/aws-cdk/issues/17874
    // So, we need create a source mapping to map the DynamoDB table to the Lambda function
    const sourceMapping = new lambda.EventSourceMapping(this, 'SourceMapping', {
      startingPosition: lambda.StartingPosition.TRIM_HORIZON,
      batchSize: 1, // only process one record at a time
      target: fn, // the lambda function to trigger
      eventSourceArn: dynamoTable.tableStreamArn, // the DynamoDB stream to read from
      bisectBatchOnError: true, // if the Lambda function fails, split the batch into two
      retryAttempts: 3, // retry 3 times if the Lambda function fails
    });

    // grant the function stream access to the DynamoDB table
    dynamoTable.grantStreamRead(fn);

    // filter the event source mapping to only process records with the specified event type (in this case, "INSERT")
    const cfnSourceMapping = sourceMapping.node
      .defaultChild as lambda.CfnEventSourceMapping; // get the underlying CloudFormation resource

    cfnSourceMapping.addPropertyOverride('FilterCriteria', {
      Filters: [
        {
          Pattern: JSON.stringify({
            eventName: ['INSERT'], // only process INSERT events
          }),
        },
      ],
    });
  }
}
