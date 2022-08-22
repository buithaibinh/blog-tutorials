import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: false });
const page = await browser.newPage();
await page.goto('https://google.com');

const returnMessage = () => 'Apify academy!';

await page.exposeFunction(returnMessage.name, returnMessage);

const msg = await page.evaluate(() => returnMessage());

console.log(msg);

await page.waitForTimeout(20000);
await browser.close();
