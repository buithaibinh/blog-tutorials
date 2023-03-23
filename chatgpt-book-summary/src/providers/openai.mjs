import { Configuration, OpenAIApi } from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

const configuration = new Configuration({
  apiKey
});

// OpenAI Client
export const openai = new OpenAIApi(configuration);

export class SummarizeText {
  constructor() {
    this.messages = [
      {
        role: 'system',
        content: 'Bạn là 1 lập trình viên javascript'
      }
    ];
  }
}
