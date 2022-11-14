import convertHtml from 'htmltiny';

import { readFile, writeFile } from 'fs';

import axios from 'axios';

const loadHtmlFromUrl = async (url) => {
  const res = await axios.get(url, {
    insecureHTTPParser: false,
  });
  return res.data;
};

const loadHtmlFromFile = async (path) => {
  return new Promise((resolve, reject) => {
    readFile(path, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.toString());
      }
    });
  });
};

const saveHtmlToFile = async (path, html) => {
  return new Promise((resolve, reject) => {
    writeFile(path, html, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

(async () => {
  // const html = await loadHtmlFromFile('./data/test.html');
  // const res = await convertHtml(html);
  // await saveHtmlToFile('./data/result.html', res);

  const html = await loadHtmlFromUrl('https://www.city.anjo.aichi.jp/event.xml');

  console.log(html);
})();
