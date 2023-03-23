import axios from 'axios';
import * as cheerio from 'cheerio';

const url =
  'https://extractorapi-extractorstackbucket98c9d9cc-r46g91dr6f7r.s3.ap-southeast-1.amazonaws.com/sample.html';

const parseTable = ($, tblEle) => {
  const rows = tblEle.find('tbody > tr');
  console.log(rows.length);
  const info = {};
  rows.each((i, row) => {
    // get all children of row
    const cols = $(row).children();
    console.log(cols.length);
    // cols.each((j, col) => {
    //   // get tag name of column
    //   const tagName = $(col).prop('tagName');
    //   console.log(tagName);
    // });
  });
};
const run = async () => {
  const html = await axios.get(url);
  const $ = cheerio.load(html);
  const tbl = $(
    'body > div > table:nth-child(1) > tbody > tr:nth-child(3) > td:nth-child(2) > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr > td > span > table:nth-child(7)'
  );
  const info = parseTable($, tbl);

  console.log(info);
};

run();
