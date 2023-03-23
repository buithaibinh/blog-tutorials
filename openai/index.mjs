import { openai } from './src/providers/openai.mjs';

import fs from 'fs';

const run = async () => {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: 'Say this is a test',
    temperature: 0,
    max_tokens: 7
  });

  console.log(response.data);
};

const genImage = async () => {
  // read the file local as a buffer
  const buffer = fs.createReadStream('./assets/1.png');
  // Set a `name` that ends with .png so that the API knows it's a PNG image
  buffer.name = 'image.png';
  const response = await openai.createImageVariation(buffer, 1, '256x256');

  console.log(response.data);
};

genImage();
