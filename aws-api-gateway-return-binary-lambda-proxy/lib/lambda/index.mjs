import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: process.env.REGION });

const streamToBuffer = (stream) => {
  const chunks = [];
  stream.on('data', (chunk) => chunks.push(chunk));
  return new Promise((resolve, reject) => {
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
};

export const handler = async (event) => {
  const number = Math.random() > 0.5 ? 1 : 0;
  if (number) {
    // read s3 image as binary
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: 'image.png'
    };

    const { Body: data } = await s3.send(new GetObjectCommand(params));

    // convert stream to buffer and then to base64
    const body = (await streamToBuffer(data)).toString('base64');

    return {
      headers: { 'Content-type': 'image/png' },
      statusCode: 200,
      body,
      isBase64Encoded: true // this is important
    };
  }

  return {
    headers: { 'Content-type': 'text/html' },
    statusCode: 200,
    body: '<h1>This is text</h1>'
  };
};
