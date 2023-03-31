import fs from 'fs';
import { fromBufferWithMimeType } from 'text-extractors';

(async () => {
  const file = fs.readFileSync('./data/sample.pdf');
  const text = await fromBufferWithMimeType(file, 'application/pdf', {
    pdf: {
      max: 1,
      workerSrc:
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js'
    }
  });
  console.log(text);
})();
