import convertHtml from 'htmltiny';

import { readFile, writeFile } from 'fs';

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
  const html = await loadHtmlFromFile('./data/test.html');
  const res = await convertHtml(html);
  await saveHtmlToFile('./data/result.html', res);
})();
