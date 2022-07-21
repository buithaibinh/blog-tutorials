#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Stack1, Stack2 } from '../lib/cdk-starter-stack-stack';

const app = new cdk.App();
const stack1 = new Stack1(app, 'Stack1', {});

// create stack2 with the bucket from stack1
new Stack2(app, 'Stack2', {
  bucket: stack1.bucket,
});
