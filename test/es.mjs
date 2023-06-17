import { Client } from '@elastic/elasticsearch';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({
  path: '.env.local'
});

const client = new Client({
  cloud: {
    id: process.env.ELASTIC_CLOUD_ID
  },
  auth: {
    apiKey: {
      id: process.env.ELASTIC_API_KEY_ID,
      api_key: process.env.ELASTIC_API_KEY
    }
  }
});

const main = async () => {
  // load 100 videos from the database
  const data = await client.search({
    index: 'videos',
    body: {
      query: {
        match_all: {}
      }
    },
    size: 100,
    _source: ['title', 'description', 'id']
  });
  const videos = data.hits.hits.map((hit) => {
    return hit._source;
  });

  fs.writeFileSync('videos.json', JSON.stringify(videos, null, 2));
};

main();
