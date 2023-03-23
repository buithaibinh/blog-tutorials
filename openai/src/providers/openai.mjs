import { Configuration, OpenAIApi } from 'openai';

// dotenv is a library that allows you to load environment variables from a .env file
import dotenv from 'dotenv';
dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});

// OpenAI Client (DALL-E)
export const openai = new OpenAIApi(configuration);

// ChatGPT Client (text-davinci-003)
// export const chatgpt = new ChatGPTAPI({
// 	apiKey: config.openAIAPIKey,
// 	maxModelTokens: config.maxModelTokens,
// });