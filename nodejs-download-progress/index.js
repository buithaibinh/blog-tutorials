const fs = require('fs');
const path = require('path');
const axios = require('axios');
const ProgressBar = require('progress');

const download = async (url) => {
  console.log('Connecting …');
  const { data, headers } = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });
  const totalLength = headers['content-length'];

  console.log('Starting download');
  const progressBar = new ProgressBar('-> downloading [:bar] :percent :etas', {
    width: 40,
    complete: '=',
    incomplete: ' ',
    renderThrottle: 1,
    total: parseInt(totalLength),
  });

  const writer = fs.createWriteStream(
    path.resolve(__dirname, 'download', 'BigBuckBunny.mp4')
  );

  data.on('data', (chunk) => progressBar.tick(chunk.length));
  data.pipe(writer);
};

(async () => {
  await download(
    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  );
})();
