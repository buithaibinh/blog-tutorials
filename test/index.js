const scrapeer = require('@sk-global/scrapeer');

// cheerio
const cheerio = require('cheerio');
const axios = require('axios');

(() => {
  const url =
  'https://www.city.fukuoka.lg.jp/hofuku/coronataisaku/health/jirei/cohs_.html';
  axios.get(url).then((res) => {
    const $ = cheerio.load(res.data);
    const content = '.wb-contents';
    const result = scrapeer.generateDescriptionFromDom($, {}, content);

    console.log('result', result);
  });
})();
