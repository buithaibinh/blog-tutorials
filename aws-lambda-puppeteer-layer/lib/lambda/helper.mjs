import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.AWS_REGION
});

export const getS3Url = async (key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: key
  });

  return getSignedUrl(s3, command, { expiresIn: 600 });
};

export const uploadFile = async (key, body, contentType = 'image/png') => {
  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType
  });

  return s3.send(command);
};
