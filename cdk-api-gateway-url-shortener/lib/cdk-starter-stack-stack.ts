import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

import { RestApiService } from './constructs/api';
import { AuthService } from './constructs/auth';

export class URLShorterStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // LinkTable, used to store the short URL and the long URL
    const linkTable = new dynamodb.Table(this, 'LinkTable', {
      partitionKey: {
        type: dynamodb.AttributeType.STRING,
        name: 'id'
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY // NOT recommended for production code
    });

    // add global secondary index, used to query the short URL by the owner
    linkTable.addGlobalSecondaryIndex({
      indexName: 'OwnerIndex',
      partitionKey: {
        type: dynamodb.AttributeType.STRING,
        name: 'owner'
      },
      projectionType: dynamodb.ProjectionType.ALL
    });

    // api service
    const api = new RestApiService(this, 'ApiService', {
      linkTable
    });

    const auth = new AuthService(this, 'shortener', {});
  }
}
