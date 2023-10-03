#!/usr/bin/env bash

set -e
source ./env.sh

for region in "${REGIONS[@]}"
do
  export AWS_REGION=$region
  echo "Destroying stack on $region"
  yarn destroy --force
done

