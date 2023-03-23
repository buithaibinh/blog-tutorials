import textract from 'textract';
import fs from 'fs';

import { openai } from './src/providers/openai.mjs';

const extractTextFromPdf = (pdfFilePath) => {
  return new Promise((resolve, reject) => {
    textract.fromFileWithPath(
      pdfFilePath,
      {
        preserveLineBreaks: true,
        pdftotextOptions: {
          // firstPage: 2
        }
      },
      function (err, text) {
        if (err) {
          reject(err);
        } else {
          resolve(text);
        }
      }
    );
  });
};

/**
 * Uses the ChatGPT to summarize the text
 * @param {*} text
 * @returns
 */
const summarizeText = async (
  text,
  prefixPrompt = 'Tóm tắt đoạn văn sau trong vòng 100 từ:'
) => {
  console.log('summarizing text', text);
  const topic = 'nodejs';
  const question = 'What is the best npm package for openai api development?';
  const message = [
    {
      role: 'system',
      content: `Bạn là 1 người đam mê đọc sách và thích tóm tắt nội dung sách.`
    },
    {
      role: 'user',
      content: `${prefixPrompt} ${text}`
    }
  ];

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo-0301',
    messages: message
  });

  return response.data.choices[0].message;
};

const run = async () => {
  console.log('Starting');
  console.time('run');

  // Converts the PDF file into .txt file.
  const pdfFilePath = './data/gian.pdf';
  console.time('extractTextFromPdf');
  const text = await extractTextFromPdf(pdfFilePath);

  // save the text to a file
  fs.writeFileSync('./data/gian.txt', text);
  console.timeEnd('extractTextFromPdf');

  // Slice the .txt file into chunks of text
  const textChunks = text.match(/.{1,2000}/g); // 2000 characters per chunk (max 2048)
  // Summarize each chunk using the ChatGPT
  console.time('summarizeText', textChunks.length);
  // const jobs = textChunks.slice(0, 1).map(async (chunk) => {
  //   const summary = await summarizeText(chunk);
  //   return summary;
  // });

  // const summaries = await Promise.all(jobs);
  console.timeEnd('summarizeText');
  // console.log('summaries', JSON.stringify(summaries, null, 2));

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
