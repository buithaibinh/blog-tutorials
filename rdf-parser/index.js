const cheerio = require('cheerio');
const { readFileSync } = require('fs');

(() => {
  const data = readFileSync('./rdf.xml', 'utf8');

  // create a cheerio instance
  const $ = cheerio.load(data);
  const collect = (index, el) => {
    const item = {};
    const url = $(el).attr('rdf:about');
    item.title = $(el).find('title').text();
    item.link = url;
    item.pubDate = $(el).find('dc\\:date').text();
    return item;
  };

  const items = $('item').map(collect).get();
  console.log(items);
})();
