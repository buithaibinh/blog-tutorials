import chromium from 'chrome-aws-lambda';
import { uploadFile, getS3Url } from './helper.mjs';

const handler = async (event) => {
  let browser = null;

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true
    });

    const page = await browser.newPage();
    const url = event.queryStringParameters?.url || 'https://www.google.com';
    await page.goto(url);

    // save screenshot to S3
    const key = `screenshots/${Date.now()}.png`;
    const screenshot = await page.screenshot({ encoding: 'base64' });
    await uploadFile(key, Buffer.from(screenshot, 'base64'));
    const screenshotURL = await getS3Url(key);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Success',
        url,
        screenshotURL: screenshotURL
      })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify(error)
    };
  } finally {
    browser?.close();
  }
};

// use this to run locally
export { handler };
