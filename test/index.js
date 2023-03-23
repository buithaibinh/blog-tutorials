const fs = require('fs');
const puppeteer = require('puppeteer');

const cheerio = require('cheerio');

const agent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36';

const pageUrl =
  'https://www.id.nlbc.go.jp/CattleSearch/search/agreement.action';

const wagyuId = '1251446067';

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const htmlMinify = (html) => {
  const $ = cheerio.load(html);

  $('script').remove();

  // replace all relative path to absolute path
  $('img, input').each((i, el) => {
    const src = $(el).attr('src');
    const fullSrc = new URL(src, pageUrl).href;
    $(el).attr('src', fullSrc);
  });

  $('link, a').each((i, el) => {
    const href = $(el).attr('href');
    const fullHref = new URL(href, pageUrl).href;
    $(el).attr('href', fullHref);
  });

  // remove search form
  $('body > div > table:nth-child(1) > tbody > tr:nth-child(3) > td:nth-child(2) > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(1)').remove();

  return $.html();
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false
  });

  let page = await browser.newPage();
  await page.setUserAgent(agent);

  console.log('Navigating to page: ', pageUrl);

  await page.goto(pageUrl, {
    waitUntil: 'networkidle2'
  });

  // click button agreement
  await page.click('input#agreement');
  await page.waitForSelector('#search input[type=tel]', {
    timeout: 3000 // 3 seconds
  });
  // input search text into the search box
  await page.type('#search input[type=tel]', wagyuId);

  // click button search
  await page.click('input#search');

  // there are 3 cases:
  // 1. no result
  // 2. has result
  // 3. cookie expired

  // wait for the results to load
  const resultSelector =
    'body > div > table:nth-child(1) > tbody > tr:nth-child(3) > td:nth-child(2) > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(3)';
  await page.waitForSelector(resultSelector, {
    timeout: 3000 // 3 seconds
  });

  // capture the screenshot of result element
  const element = await page.$(resultSelector);

  // const buff = await element.screenshot({
  //   path: 'result.png'
  // });

  // // save the screenshot to disk
  // fs.writeFileSync('result.png', buff);

  // get html content
  const html = await page.content();

  // minify html
  const minifiedHtml = htmlMinify(html);

  // save the html to disk
  fs.writeFileSync('result.html', minifiedHtml);


  // close the browser
  await page.close();
  await browser.close();
})();
