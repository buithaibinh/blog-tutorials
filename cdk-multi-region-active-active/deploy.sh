#!/usr/bin/env bash

set -e
source ./env.sh

# Loop through the regions and deploy the stack
for region in "${REGIONS[@]}"
do
  export AWS_REGION=$region
  echo "Deploying stack to $region"
  yarn cdk bootstrap
  yarn deploy --require-approval never
done

# export AWS_REGION="us-east-1"
# yarn cdk bootstrap
# yarn deploy --require-approval never
# export AWS_REGION="eu-west-1"
# yarn cdk bootstrap
# yarn deploy --require-approval never
# export AWS_REGION="ap-southeast-1"
# yarn cdk bootstrap
# yarn deploy --require-approval never
