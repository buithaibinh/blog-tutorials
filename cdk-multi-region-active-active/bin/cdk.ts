#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkMultiRegionActiveActiveStack } from '../lib/stack';

const app = new cdk.App();
new CdkMultiRegionActiveActiveStack(app, 'CdkMultiRegionActiveActiveStack', {
  env: {
    region: process.env.AWS_REGION ?? process.env.CDK_DEFAULT_REGION,
  },
  hostedZoneId: process.env.HOSTED_ZONE_ID!,
  domainName: process.env.DOMAIN_NAME!,
});
