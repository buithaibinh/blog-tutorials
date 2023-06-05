#!/bin/bash

# test aws cli installation
echo "Testing aws cli installation..."
aws --version

echo "Starting ffmpeg task..." && \
echo "Copying video from s3://${S3_BUCKET}/${INPUT_VIDEO} to ${INPUT_VIDEO}..." && \
aws s3 cp s3://${S3_BUCKET}/${INPUT_VIDEO} ./${INPUT_VIDEO} && \

# get time duration of the video. it will be used to calculate the time offset
# echo "Getting video duration..." && \
# DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ./${INPUT_VIDEO}) && \

# run ffmpeg
ffmpeg -v error -i ./${INPUT_VIDEO} -ss ${TIME_OFFSET} -vframes 1 -f image2 -an -y ${OUTPUT_FILE} && \
echo "Copying thumbnail to S3://${S3_BUCKET}/${OUTPUT_FILE} ..." && \
aws s3 cp ./${OUTPUT_FILE} s3://${S3_BUCKET}/${OUTPUT_FILE}

# cleanup
rm -f ./${INPUT_VIDEO}
rm -f ./${OUTPUT_FILE}
