# Welcome to your CDK TypeScript project

A repository for an article on
[codewithyou.com](https://www.codewithyou.com/blog/cloudfront-restrict-user-access-by-signed-urls)

## How to Use

1. Clone the repository

2. Install the dependencies

```bash
yarn install
```

3. Generate key pair

```bash
openssl genrsa -out ./keys/private_key.pem 2048
openssl rsa -pubout -in ./keys/private_key.pem -out ./keys/public_key.pem
```
4. Deploy the stack

```bash
npx cdk deploy \
  --outputs-file ./cdk-outputs.json
```

## Testing

```bash
cd scripts
node index.js
```

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npx cdk deploy` deploy this stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template