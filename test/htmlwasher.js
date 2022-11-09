const htmlWasher = (html) => {
    const libtidy = require('libtidy');
    const htmlBuffer = Buffer.from(html);
    var doc = libtidy.TidyDoc();
    doc.options = {
        forceOutput: true,
        output_xhtml: false,
    };
    doc.parseBufferSync(htmlBuffer);
    doc.cleanAndRepairSync();
    const res = doc.saveBufferSync();
    return res.toString();
};

export default htmlWasher;
