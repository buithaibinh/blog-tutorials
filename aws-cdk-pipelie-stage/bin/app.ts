#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AppPipelineStack } from '../lib/app-pipeline-stack';

const app = new cdk.App();
new AppPipelineStack(app, 'AppPipelineStack', {
  sourceBranch: 'main',
  sourceRepository: 'buithaibinh/aws-cdk-demo-pipline',
  sourceConnectionArn: 'arn:aws:codestar-connections:ap-southeast-1:057627104303:connection/3f561929-edb9-4ff7-849f-7ab319c8504d'
});
