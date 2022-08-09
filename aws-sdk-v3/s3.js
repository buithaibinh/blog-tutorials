import fs from 'fs';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { createServer } from 'http';
import { parse } from 'url';

import 'dotenv/config';

const { S3_BUCKET } = process.env;

const s3Client = new S3Client({
  region: 'ap-southeast-1',
});

/**
 * Util functions, convert ReadableStream to a string
 * @param {*} stream
 * @returns
 */
const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });

const getS3Object = async (bucket, key) => {
  const { Body } = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );

  // the Body is Readable or ReadableStream | Blob;
  return Body;
};

const server = createServer(async (req, res) => {
  const key = 'readme.txt';
  const bucket = S3_BUCKET;

  // Parse the request url
  const reqUrl = parse(req.url).pathname;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  if (reqUrl == '/') {
    // Read file from S3
    const body = await getS3Object(bucket, key);
    // convert to string
    const text = body.toArray().toString('utf8');
    return res.end(text);
  }
  if (reqUrl == '/text') {
    // Read file from S3
    const body = await getS3Object(bucket, key);
    // convert to string
    const text = await streamToString(body);
    return res.end(text);
  }

  // case 2: don't read stream data, pipe to client
  if (reqUrl == '/stream') {
    // Read file from S3
    const body = await getS3Object(bucket, key);
    // pipe to response
    return body.pipe(res);
  }

  // case 3: save text file to local
  if (reqUrl == '/save') {
    // Read file from S3
    const body = await getS3Object(bucket, key);
    // save file to local
    body.pipe(fs.createWriteStream(key.split('/').pop()));
    return res.end('Saved');
  }

  return res.end('404');
});

server.listen(9000);
