import { S3Event } from 'aws-lambda';
import { FargateTask } from './fargate.task';

const FARGATE_CLUSTER = process.env.FARGATE_CLUSTER!;
const FARGATE_TASK_DEFINITION = process.env.FARGATE_TASK_DEFINITION!;
const FARGATE_CONTAINER_NAME = process.env.FARGATE_CONTAINER_NAME!;
const FARGATE_SUBNET_IDS = process.env.FARGATE_SUBNET_IDS!;

/**
 * handle new video event when a new video is uploaded to the bucket
 * @param event
 */
export const onNewVideoHandler = async (event: S3Event) => {
  console.log('onNewVideoHandler', event);
  // When a new video is uploaded, run the FFMPEG task on the video file.
  // Use the time index specified in the filename (e.g. cat_00-01.mp4 uses timestamp 00:01)
  if (!event.Records || event.Records.length === 0) {
    console.log('*** New video: no records found.');
    return;
  }

  console.log('environment variables', {
    FARGATE_CLUSTER,
    FARGATE_TASK_DEFINITION,
    FARGATE_CONTAINER_NAME,
    FARGATE_SUBNET_IDS,
  });

  // loop through all the records
  for (const record of event.Records) {
    console.log(
      `*** New video: file ${record.s3.object.key} was uploaded at ${record.eventTime}.`
    );

    const file = record.s3.object.key;
    const bucket = record.s3.bucket.name;
    const thumbnailFile = file.substring(0, file.indexOf('_')) + '.jpg';

    // we need to upload video with the name of cat_00-01.mp4
    // if the file name is cat_00-01.mp4, then framePos is 00:01
    let framePos = file
      .substring(file.indexOf('_') + 1, file.indexOf('.'))
      .replace('-', ':');

    // if framePos is not a valid time index, set it to 00:00
    if (!framePos.match(/\d\d:\d\d/)) {
      framePos = '00:00';
    }

    console.log(
      `*** New video: thumbnail file ${thumbnailFile} at ${framePos}.`
    );

    // run ffmpegThumbnailTask on the video file
    const task = new FargateTask({
      taskDefinition: FARGATE_TASK_DEFINITION,
      cluster: FARGATE_CLUSTER,
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: FARGATE_SUBNET_IDS.split(','),
          assignPublicIp: 'ENABLED'
        }
      }
    });

    await task.run({
      overrides: {
        containerOverrides: [
          {
            name: FARGATE_CONTAINER_NAME,
            environment: [
              {
                name: 'S3_BUCKET',
                value: bucket
              },
              {
                name: 'INPUT_VIDEO',
                value: file
              },
              {
                name: 'TIME_OFFSET',
                value: framePos
              },
              {
                name: 'OUTPUT_FILE',
                value: thumbnailFile
              }
            ]
          }
        ]
      }
    });

    console.log(`*** New video: thumbnail task started for ${file}.`);
  }

  return {
    statusCode: 200
  };
};

/**
 * handle new thumbnail event when a new thumbnail created for a video and uploaded to the bucket
 * @param event
 */
export const onNewThumbnailHandler = async (event: S3Event) => {
  // When a new thumbnail is created, log a message.
  console.log('onNewThumbnailHandler', event);

  // loop through all the records
  for (const record of event.Records) {
    console.log(
      `*** New thumbnail: file ${record.s3.object.key} was uploaded at ${record.eventTime}.`
    );
  }

  return {
    statusCode: 200
  };
};
