// import .env variables
import dotenv from 'dotenv';
dotenv.config({
  path: '.env.local'
});
/// =======================================================

import { OpenAI } from 'langchain/llms/openai';
import { loadSummarizationChain } from 'langchain/chains';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import * as fs from 'fs';

// In this example, we use a `MapReduceDocumentsChain` specifically prompted to summarize a set of documents.
const text = fs.readFileSync('./data/vn.txt', 'utf8');
const model = new OpenAI({ temperature: 0 });
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 2000  // 1000 characters per chunk
});
const docs = await textSplitter.createDocuments([text]);

// This convenience function creates a document chain prompted to summarize a set of documents.
const chain = loadSummarizationChain(model, {
  type: 'map_reduce',
  returnIntermediateSteps: false
});
const res = await chain.call({
  input_documents: docs
});
console.log({ res });
