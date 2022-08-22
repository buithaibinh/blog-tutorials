import { S3Event, APIGatewayProxyResultV2 } from 'aws-lambda';
import util from 'util';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

/* eslint-disable import/extensions, import/no-absolute-path */
import sharp from '/opt/nodejs/node_modules/sharp';

const s3 = new S3Client({});
const DEST_BUCKET_NAME = process.env.DEST_BUCKET_NAME;

const sizesToScale = [{ width: 200 }, { width: 400 }];

const success = (message: string = 'OK'): APIGatewayProxyResultV2 => ({
  statusCode: 200,
  body: JSON.stringify({ message }),
});

const error = (
  message: string = 'Internal Server Error'
): APIGatewayProxyResultV2 => ({
  statusCode: 500,
  body: JSON.stringify({ message }),
});

const streamToBuffer = (stream: any): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: any = [];
    stream.on('data', (chunk: any) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

export async function main(event: S3Event): Promise<APIGatewayProxyResultV2> {
  console.log(event);
  // Read options from the event parameter.
  console.log(
    'Reading options from event:\n',
    util.inspect(event, { depth: 5 })
  );

  const srcBucket = event.Records[0].s3.bucket.name;
  // Object key may have spaces or unicode non-ASCII characters.
  const srcKey = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, ' ')
  );
  // Infer the image type from the file suffix.
  const typeMatch = srcKey.match(/\.([^.]*)$/);
  if (!typeMatch) {
    console.log('Could not determine the image type.');
    return error('Could not determine the image type.');
  }

  // Check that the image type is supported
  const imageType = typeMatch[1].toLowerCase();
  if (imageType != 'jpg' && imageType != 'png') {
    console.log(`Unsupported image type: ${imageType}`);
    return error(`Unsupported image type: ${imageType}`);
  }

  const { Body } = await s3.send(
    new GetObjectCommand({
      Bucket: srcBucket,
      Key: srcKey,
    })
  );
  if (Body) {
    const originalImage = await streamToBuffer(Body);
    const tasks = sizesToScale.map(async (size) => {
      const { width } = size;
      const destKey = `${srcKey.replace(
        /\.([^.]*)$/,
        ''
      )}-${width}.${imageType}`;

      const buffer = await sharp(originalImage)
        .resize({
          width,
        })
        .toBuffer();
      return s3.send(
        new PutObjectCommand({
          Bucket: DEST_BUCKET_NAME,
          Key: destKey,
          Body: buffer,
        })
      );
    });
  } else {
    return error('Could not read image from S3.');
  }

  return success();
}
