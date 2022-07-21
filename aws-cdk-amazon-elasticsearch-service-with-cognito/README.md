# Welcome to your CDK TypeScript project

A repository for an article on
[codewithyou.com](https://www.codewithyou.com/blog/launch-amazon-elasticsearch-service-with-amazon-cognito-user-pools)

## How to Use

1. Clone the repository

2. Install the dependencies

```bash
npm install
```

3. Create the CDK stack

```bash
npx cdk deploy \
  --outputs-file ./cdk-outputs.json
```
## Access the Example Dashboard

As soon as the application is deployed completely the outputs of the AWS CloudFormation stack provides the links for the next steps. You will find two URLs in the `cdk-outputs.json` called createUserUrl and kibanaUrl.

* Use the createUserUrl link from the outputs, or navigate to the Amazon Cognito user pool in the console to create a new user in the pool. Enter an email address as username and email. Enter a temporary password of your choice with at least 8 characters. Leave the phone number empty and uncheck the checkbox to mark the phone number as verified. If you like you can check the checkboxes to send an invitation to the new user or to make the user verify the email address. Then choose Create user.

![create_user](/images/create_user.png)

* Access the Kibana dashboard with the kibanaUrl link from the outputs, or navigate to the Kibana link displayed in the Amazon Elasticsearch Service console.

![dashboard](/images/dash_broad.png)

## Cleaning Up

To avoid incurring charges, delete the AWS CloudFormation stack when you are finished experimenting via `npx cdk destroy` in the directory where cdk.json is:

```bash
npx cdk destroy
```