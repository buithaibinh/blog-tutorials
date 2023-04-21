import Importer from './src/importer.mjs';
import fs from 'fs';
import Papa from 'papaparse';

const HOST = 'http://localhost';
const PORT = 9200;

(async () => {
  const schema = fs.readFileSync('./schema/movies.json', 'utf8');

  const csv = fs.readFileSync('./data/movies.csv', 'utf8');
  const { data } = Papa.parse(csv, {
    header: true
  });

  // modify data to match schema
  const dataSet = data.map((item) => {
    let year = item.title.match(/.*\((.*)\).*/) || [];
    year = year[1] || '';
    return {
      ITEM_ID: item.movieId,
      TITLE: item.title,
      GENRES: item.genres.split('|'),
      YEAR: year,
      CREATION_TIMESTAMP: Date.now()
    };
  });

  const importer = new Importer({
    host: HOST,
    port: PORT,
    schema: JSON.parse(schema),
    data: dataSet,
    deleteBeforeImport: true
  });

  await importer.start();
})();
