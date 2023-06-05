#!/usr/bin/env bash

# load aws credentials from development environment
# this way we don't need to store aws credentials in the repository
AWS_ACCESS_KEY_ID=$(aws --profile default configure get aws_access_key_id)
AWS_SECRET_ACCESS_KEY=$(aws --profile default configure get aws_secret_access_key)

# load environment variables from .env file
source .env

# test environment variables were loaded
echo "Testing environment variables..."
echo $S3_BUCKET

# Build docker image linux x86_64 because jrottenberg/ffmpeg is only available for linux x86_64
docker build -t ffmpeg-thumbnailer --platform linux/amd64 .

# Run docker image
docker run -it --rm \
   -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
   -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
   -e S3_BUCKET=$S3_BUCKET \
   -e INPUT_VIDEO=$INPUT_VIDEO \
   -e TIME_OFFSET=$TIME_OFFSET \
   -e OUTPUT_FILE=$OUTPUT_FILE \
   ffmpeg-thumbnailer