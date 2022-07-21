# Lambda Nodejs Container with Custom Python Runtime

A repository for an article on [codewithyou.com](https://www.codewithyou.com/blog/docker-lambda-node-with-python)

## Why do we need a custom lambda runtime?

* Let's assume that we want to execute python file in a node js environment.

* So the container image should have both python and node js runtime and the container should compatible with lambda

## How to use this demo?

* Create a Repo in Amazon ECR.
* Then execute the below commands to push your image to ECR from your working directory.

*Note: Please change {aws_region} and {aws_account} as your expected*
```bash
aws ecr get-login-password --region {aws_region} | docker login --username AWS --password-stdin {aws_account}.dkr.ecr.{aws_region}.amazonaws.com

docker buildx build --platform linux/amd64 -t skg/lambda-python-node .

docker tag skg/lambda-python-node:latest {aws_account}.dkr.ecr.{aws_region}.amazonaws.com/skg/lambda-python-node:latest

docker push {aws_account}.dkr.ecr.{aws_region}.amazonaws.com/skg/lambda-python-node:latest
```
* go to the Lambda console and create a lambda function using the uploaded container image.

## Reference
https://www.npmjs.com/package/aws-lambda-ric
