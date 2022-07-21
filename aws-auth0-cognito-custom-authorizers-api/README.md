# API Gateway Authorizer Function for Auth0 or AWS Cognito using the JWKS method.

A repository for an article on
[codewithyou.com](https://www.codewithyou.com/blog/aws-auth0-cognito-custom-authorizers-api)

## Setup

1. Clone the repository

2. Install the dependencies

```bash
npm install
```

3. In `lib/cdk-starter-stack-stack.ts` replace the value of IIS_URL with either your [Auth0 iss](https://auth0.com/docs/secure/tokens/id-tokens) or [AWS Cognito ISS](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html). Make sure the iss url ends in without a trailing /.

```json
{
  "IIS_URL": "https://<url>.com"
}
```
4. Deploy the stack and grab the public and private endpoints.

```bash
npx cdk deploy \
  --outputs-file ./cdk-outputs.json
```

## Test Authentication

* Test with [Postman](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop?hl=en): Make a new GET request with the Header containing "Authorization" with the value being "bearer <id_token>" for your private url.
* Test using curl:

```bash
curl --header "Authorization: bearer <id_token>" https://{api}.execute-api.{region}.amazonaws.com/private
```

## Cleanup

```bash
npx cdk destroy
```