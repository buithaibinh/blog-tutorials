import { fromBufferWithMimeType } from 'text-extractors';
import fs from 'fs';

import { Conversation } from './src/providers/openai.mjs';

const extractTextFromPdf = async (pdfFilePath) => {
  const buffer = fs.readFileSync(pdfFilePath);
  let text = await fromBufferWithMimeType(buffer, 'application/pdf', {
    pdf: {
      max: 0
    }
  });

  // remove more than 1 breakline in a row
  // text = text.replace(/\n{1,}/g, '\n');
  return text;
};

const splitText = (text, maxLength = 5000, minLength = 0) => {
  const lines = text.split('\n');
  const result = [];

  let i = 0;
  while (i < lines.length) {
    let chunk = [lines[i]];
    let length = lines[i].length + 1;

    while (length < maxLength && i < lines.length - 1) {
      i++;
      let line = lines[i];
      length += line.length + 1;
      chunk.push(line.trim());
    }

    if (length >= minLength) {
      result.push(chunk.join('\n'));
    }
    i++;
  }

  return result;
};
/**
 * Uses the ChatGPT to summarize the text
 * @param {*} text
 * @returns
 */
const summarizeText = async (text, prefixPrompt = 'Tóm tắt đoạn văn sau:') => {
  // split text by breakline or max 5000 characters
  // https://stackoverflow.com/questions/497790
  const textChunks = splitText(text, 5000);

  // build message to ask chatgpt
  const messages = textChunks.map((chunk) => {
    return {
      role: 'user',
      content: chunk
    };
  });

  const results = [];
  // loop through the messages and ask chatgpt to summarize the text
  // avoid rate limit we only ask chatgpt to summarize 1 text at a time
  console.log(messages.length);
  for (const [idx, message] of messages.slice(30).entries()) {
    // const response = await openai.createChatCompletion({
    //   model: 'gpt-3.5-turbo-0301',
    //   messages: [message]
    // });
    const conversation = new Conversation();
    const response = await conversation.send(message.content);
    console.log(response);

    // save the result to a file
    // get index of the message
    // const index = messages.indexOf(message);
    const fileName = `./data/summary-${idx}.txt`;
    const text = [message.content].join('\n');
    fs.writeFileSync(fileName, text);
  }

  console.log('---------Done');
  const conversation = new Conversation();
  const response = await conversation.send("end of book");
  console.log(response);


  // const answer = results.join('\n');

  // if (answer.length > 5000) {
  //   // if the answer is too long, we ask chatgpt to summarize the answer again
  //   return summarizeText(answer, prefixPrompt);
  // }

  // // ask chat gpt to summarize the answer again
  // const response = await openai.createChatCompletion({
  //   model: 'gpt-3.5-turbo-0301',
  //   messages: [
  //     {
  //       role: 'user',
  //       content: `${prefixPrompt} ${answer}`
  //     }
  //   ]
  // });

  // // finally return the answer
  // return response.data.choices[0].message;
  return {
    content: results.join('\n')
  };
};

const run = async () => {
  console.log('Starting');
  console.time('run');

  // Converts the PDF file into .txt file.
  const pdfFilePath = './data/gian.pdf';
  console.time('extractTextFromPdf');
  const text = await extractTextFromPdf(pdfFilePath);

  // save the text to a file
  // build the file name from the pdf file name
  const fileName = pdfFilePath.split('/').pop().split('.').shift();
  const textFilePath = `./data/${fileName}.txt`;
  fs.writeFileSync(textFilePath, text);
  console.timeEnd('extractTextFromPdf');

  // Slice the .txt file into chunks of text
  const { content } = await summarizeText(text);
  // save final result to a file
  const finalFileName = `./data/summary-final.txt`;
  fs.writeFileSync(finalFileName, content);
  // console.log(text);

  console.timeEnd('run');
  console.log('Done');
};

(async () => {
  try {
    await run();
  } catch (error) {
    console.error(error);
  }
})();
