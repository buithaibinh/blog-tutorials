// Imports the Google Cloud client library

import { ImageAnnotatorClient } from '@google-cloud/vision';
// Creates a client
const client = new ImageAnnotatorClient();

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
const bucketName = 'Bucket where the file resides, e.g. my-bucket';
const fileName = 'Path to file within bucket, e.g. path/to/image.png';

const request = {
  image: {
    source: {
      imageUri: `gs://${bucketName}/${fileName}`
    }
  },
  imageContext: {
    webDetectionParams: {
      includeGeoResults: true
    }
  }
};

// Detect similar images on the web to a remote file
const [result] = await client.webDetection({
  image: {
    source: {
      imageUri: `gs://${bucketName}/${fileName}`
    }
  },
  imageContext: {
    webDetectionParams: {
      includeGeoResults: true
    }
  },

});
const webDetection = result.webDetection;
webDetection.webEntities.forEach((entity) => {
  console.log(`Score: ${entity.score}`);
  console.log(`Description: ${entity.description}`);
});
