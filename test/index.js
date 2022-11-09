const libtidy = require('libtidy');

const fs = require('fs');

(() => {
  const html = fs.readFileSync('./data/test.html', 'utf8');

  const htmlBuffer = Buffer.from(html);

  var doc = libtidy.TidyDoc();
  doc.options = {
    forceOutput: true,
    output_xhtml: false,
  };
  doc.parseBufferSync(htmlBuffer);

  doc.cleanAndRepairSync();
  const res = doc.saveBufferSync();

  fs.writeFileSync('./data/result.html', res.toString());
})();
