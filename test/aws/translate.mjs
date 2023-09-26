// use aws translate to translate json file

import {
  TranslateClient,
  TranslateTextCommand,
} from '@aws-sdk/client-translate'; // ES Modules import

import fs from 'fs';
import path from 'path';

const translateClient = new TranslateClient({});

const translate = async (text, sourceLang, targetLang) => {
  const params = {
    SourceLanguageCode: sourceLang,
    TargetLanguageCode: targetLang,
    Text: text,
  };
  const command = new TranslateTextCommand(params);
  const response = await translateClient.send(command);
  return response.TranslatedText;
};

// read json file
import { data } from './data.mjs';

// translate json file
const translateJson = async (data, sourceLang, targetLang) => {
  const skipKeys = ['global'];
  const translatedData = {};

  const getLeafKeys = (obj) => {
    // get all leaf keys in object
    const keys = [];
    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        keys.push(...getLeafKeys(obj[key]));
      } else {
        keys.push(key);
      }
    }
    return keys;
  };

  const leafKeys = getLeafKeys(data);

  for (const key in data) {
    // skip keys
    if (skipKeys.includes(key)) {
      translatedData[key] = data[key];
      continue;
    }
    // only translate it is leaf key
    if (leafKeys.includes(key)) {
      const text = data[key];
      const translatedText = await translate(text, sourceLang, targetLang);
      translatedData[key] = translatedText;
    } else {
      translatedData[key] = await translateJson(
        data[key],
        sourceLang,
        targetLang
      );
    }
  }
  return translatedData;
};

// write translated json file
const writeJson = async (data, sourceLang, targetLang) => {
  const translatedData = await translateJson(data, sourceLang, targetLang);
  const translatedDataString = JSON.stringify(translatedData);
  fs.writeFileSync(`data/${targetLang}.json`, translatedDataString);
};

// list of supported languages
const languages = ['fr', 'id', 'it', 'ja', 'ko', 'pt', 'ro', 'ru', 'vi', 'zh'];
// const languages = ['fr'];

for (const lang of languages) {
  writeJson(data, 'en', lang);
}
