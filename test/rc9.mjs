import { DATA } from './videos.mjs';

import fs from 'fs';

const randomNum = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const main = async () => {
  // convert array to object
  const videoStats = {};
  const keywordStats = {};
  DATA.forEach((video) => {
    videoStats[video.id] = {
      LIKE: randomNum(0, 100),
      VIEW: randomNum(0, 100),
      PIN: randomNum(0, 100),
      NOT_INTERESTS: randomNum(0, 100)
    };
    const keywords = video.tags.split(',').slice(0, 5);
    keywords.forEach((keyword) => {
      keywordStats[keyword] = {
        point: keywordStats[keyword] ? keywordStats[keyword].point + 1 : 1,
        LIKE: randomNum(0, 100),
        VIEW: randomNum(0, 100),
        PIN: randomNum(0, 100),
        NOT_INTERESTS: randomNum(0, 100)
      };
    });
  });

  const stats = {
    id: 'STATS-2023-5-17',
    videoStats,
    keywordStats
  };
  // save to file
  fs.writeFileSync('stats.json', JSON.stringify(stats, null, 2));

  // build stats
};

main();
