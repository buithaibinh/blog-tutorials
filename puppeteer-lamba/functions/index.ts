import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

import chromium from 'chrome-aws-lambda';

import * as cheerio from 'cheerio';

const agent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36';

const pageUrl =
  'https://www.id.nlbc.go.jp/CattleSearch/search/agreement.action';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

const htmlMinify = (html: string) => {
  const $ = cheerio.load(html);

  $('script').remove();

  // replace all relative path to absolute path
  $('img, input').each((i, el) => {
    const src = $(el).attr('src');
    if (!src) return;
    const fullSrc = new URL(src, pageUrl).href;
    $(el).attr('src', fullSrc);
  });

  $('link, a').each((i, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    const fullHref = new URL(href, pageUrl).href;
    $(el).attr('href', fullHref);
  });

  // remove search form
  $(
    'body > div > table:nth-child(1) > tbody > tr:nth-child(3) > td:nth-child(2) > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(1)'
  ).remove();

  return $.html();
};

const saveToS3 = async (key: string, data: any, contentType = 'image/png') => {
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    Body: data,
    ContentType: contentType,
    ACL: 'public-read'
  };

  try {
    const result = await s3Client.send(new PutObjectCommand(params));
    console.log('S3 result: ', result);
  } catch (error) {
    console.log('S3 error: ', error);
  }
};

export async function handler(event: any): Promise<APIGatewayProxyResultV2> {
  let browser: any = null;

  try {
    console.log('URL: ', pageUrl);
    const wagyuId = event.wagyuId || '1251446067';

    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true
    });

    let page = await browser.newPage();
    // await page.setUserAgent(agent);

    console.log('Navigating to page: ', pageUrl, wagyuId);

    await page.goto(pageUrl);

    // click button agreement
    await page.click('input#agreement');
    console.log('Click agreement button');
    await page.waitForSelector('#search input[type=tel]', {
      timeout: 3000 // 3 seconds
    });

    // input search text into the search box
    await page.type('#search input[type=tel]', wagyuId);

    // click button search
    await page.click('input#search');

    // wait for the results to load
    const resultSelector =
      'body > div > table:nth-child(1) > tbody > tr:nth-child(3) > td:nth-child(2) > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(3)';
    await page.waitForSelector(resultSelector, {
      timeout: 3000 // 3 seconds
    });

    // capture the screenshot of result element
    // const element = await page.$(resultSelector);
    const html = await page.content();

    // minify html
    const minifiedHtml = htmlMinify(html);

    // save html content to s3
    await saveToS3(`result/${wagyuId}.html`, minifiedHtml, 'text/html');

    await page.close();
  } catch (error) {
    console.log(error);
    return {
      body: JSON.stringify({ message: 'Error from Lambda' }),
      statusCode: 500
    };
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }

  // this response will be returned to the API Gateway
  // it support both rest api and http api
  return {
    body: JSON.stringify({ message: 'Hello from Lambda' }),
    statusCode: 200,
    isBase64Encoded: false,
    headers: {
      'Content-Type': 'application/json'
    }
  };
}
