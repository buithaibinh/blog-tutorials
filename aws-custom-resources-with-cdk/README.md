# AWS Custom Resource

## Problem

Assuming you have a CloudFormation stack that includes an S3 bucket, and you want to add some files to the bucket for your application to use. And you want to do this without having to manually upload the files to the bucket every time you update the stack. If you delete the stack, you want the files to be deleted as well. How do you do this?

## Solution

This is where AWS Custom Resources come in. You can create a Lambda function which will be triggered when the stack is created or updated. The Lambda function can then upload the files to the S3 bucket. And when the stack is deleted, the Lambda function can delete the files from the bucket. This is all done automatically. You don't have to do anything manually.

## What is AWS Custom Resource?

Custom resources enable you to write custom provisioning logic in templates that AWS CloudFormation runs anytime you create, update (if you changed the custom resource), or delete stacks. For example, you might want to include resources that aren't available as AWS CloudFormation resource types. You can include those resources by using custom resources. That way you can still manage all your related resources in a single stack. You can also use custom resources to create resources that are available as AWS CloudFormation resource types, but that you want to manage in a different way than the default behavior. For example, you might want to create a resource that is available as an AWS CloudFormation resource type, but you want to create it in a different region than the region in which the stack is created.

Source: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-custom-resources.html

## How create a custom resource in AWS CDK?

AWS offers a CDK construct for creating custom resources. The construct is called `CustomResource`. You can find the documentation here: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.custom_resources-readme.html .