// import .env variables
import dotenv from 'dotenv';
dotenv.config({
  path: '.env.local'
});
/// =======================================================
import { BabyAGI } from "langchain/experimental/babyagi";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";

const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings());

const babyAGI = BabyAGI.fromLLM({
  llm: new OpenAI({ temperature: 0 }),
  vectorstore: vectorStore,
  maxIterations: 3,
});

// await babyAGI.call({ objective: "Use google lens and tell me what the name of the product in this image: https://m.media-amazon.com/images/I/51y5PR+9OKL._AC_SY300_SX300_.jpg" });
console.time("babyagi");
await babyAGI.call({ objective: "Use google lens and tell me what the name of the product in this image: https://m.media-amazon.com/images/I/51y5PR+9OKL._AC_SY300_SX300_.jpg" });
console.timeEnd("babyagi");
