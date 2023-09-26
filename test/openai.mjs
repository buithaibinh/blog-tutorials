import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';
dotenv.config({
  path: '.env.local'
});

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

const chatCompletion = await openai.createChatCompletion({
  model: 'gpt-4-32k-0613',
  messages: [{ role: 'user', content: 'Hello world' }]
});
console.log(chatCompletion.data.choices[0].message);
