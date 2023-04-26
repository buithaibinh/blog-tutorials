import { handler } from './index.mjs';

// load dotenv variables
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  console.log('Running locally');
  const event = {
    queryStringParameters: {
      url: 'https://www.google.com'
    }
  };
  const result = await handler(event);
  console.log(result);
})();
