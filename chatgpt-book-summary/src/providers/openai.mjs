import {
  Configuration,
  OpenAIApi,
  ChatCompletionRequestMessageRoleEnum
} from 'openai';

import dedent from 'dedent';

const apiKey =
  process.env.OPENAI_API_KEY ||
  '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';

const configuration = new Configuration({
  apiKey
});

export class Conversation {
  constructor() {
    this.client = new OpenAIApi(configuration);
    this.messages = [
      {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: dedent(`
        You are book summary agency. You have a customer who wants to buy a book summary.
        The customer will sends you the book part by part.
        The customer will send part by part of the book to you. If the customer sends you the whole book, you will write the summary of the book.
        If you see "end of book" in the customer's message, you will write the summary of the book.
        Otherwise, you just answer "READ" is enough.
        Note that, don't write the summary of the book if you not see "end of book" in the customer's message.
        `)
      }
    ];
  }

  // Send a message to the agent.
  async send(message) {
    // push the message to the messages array\
    this.messages.push({
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: message
    });

    // send the message to OpenAI
    const response = await this.client.createChatCompletion({
      // model: 'gpt-4', // the model to use for completion. The default is gpt-3
      model: 'gpt-3.5-turbo-0301',
      // max_tokens: 100, // the maximum number of tokens to generate
      // temperature: 0.7, // the value used to module the next token probabilities
      messages: [...this.messages] // clone the messages array and add the message
    });

    const choices = response.data.choices;
    if (choices.length > 0) {
      const choice = choices[0];
      console.log(choice.message);
      this.messages.push(choice.message);
    } else {
      throw new Error('No response from OpenAI');
    }
  }
}
