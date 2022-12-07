import * as chrono from 'chrono-node';

(async () => {
  // const html = await loadHtmlFromFile('./data/test.html');
  // const res = await convertHtml(html);
  // await saveHtmlToFile('./data/result.html', res);

  let date = chrono.parseDate('2022-11-29T15:00:00JST');

  date = new Date(date).toISOString();

  console.log("date", date);

})();
