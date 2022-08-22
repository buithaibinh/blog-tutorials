import puppeteer from 'puppeteer';
import { load } from 'cheerio';

const products = [];

const browser = await puppeteer.launch({ headless: false });
const page = await browser.newPage();

await page.goto('https://www.aboutyou.com/c/women/clothing-20204');

// Grab the height of result item in pixels, which will be used to scroll down
const itemHeight = await page.$eval('a[data-testid*="productTile"]', (elem) => elem.clientHeight);

// Keep track of how many pixels have been scrolled down
let totalScrolled = 0;

while (products.length < 75) {
    const scrollHeight = await page.evaluate(() => document.body.scrollHeight);

    await page.mouse.wheel({ deltaY: itemHeight * 3 });
    totalScrolled += itemHeight * 3;
    // Allow the products 1 second to load
    await page.waitForTimeout(1000);

    const $ = load(await page.content());

    // Grab the newly loaded items
    const items = [...$('a[data-testid*="productTile"]')].slice(products.length);

    const newItems = items.map((item) => {
        const elem = $(item);

        return {
            brand: elem.find('p[data-testid="brandName"]').text().trim(),
            price: elem.find('span[data-testid="finalPrice"]').text().trim(),
        };
    });

    products.push(...newItems);

    const innerHeight = await page.evaluate(() => window.innerHeight);

    // if the total pixels scrolled is equal to the true available scroll
    // height of the page, we've reached the end and should stop scraping.
    // even if we haven't reach our goal of 75 products.
    if (totalScrolled >= scrollHeight - innerHeight) {
        break;
    }
}

console.log(products.slice(0, 75));

await browser.close();