# Welcome to your CDK TypeScript project

A repository for an article on
[codewithyou.com](https://www.codewithyou.com/blog/aws-cdk-using-amazon-api-gateway-as-a-proxy-for-dynamodb)

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

4. Open the AWS CloudFormation Console and the stack should be created in your default region

5. Cleanup

```bash
npx cdk destroy
```

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npx cdk deploy` deploy this stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template
