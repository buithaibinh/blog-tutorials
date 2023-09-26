import axios from 'axios';
import https from 'https';

const url = 'https://www.city.himeji.lg.jp/rss/rss_new_castle.xml';
const agent = new https.Agent({
  rejectUnauthorized: false,
});

const run = async ({ url, payload, headers }) => {
  try {
    const res = await axios.get(url, {
      data: payload,
      headers,
      httpsAgent: agent,
    });
    // parse response
    const { data } = res;
    console.log('data', data);
  } catch (error) {
    console.log('error', error);
    // parse response
    if (error.response) {
      // get response data
      const { data } = error.response;
      console.log('data', data);
    }
  }
};

run({
  url,
});
