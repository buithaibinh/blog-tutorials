import Importer from './src/importer.mjs';
import fs from 'fs';
import Papa from 'papaparse';

const HOST = 'http://localhost';
const PORT = 9200;

import { JSONPath } from 'jsonpath-plus';

const generateUsers = () => {
  // if not exist user data, create it
  if (!fs.existsSync('./data/users.csv')) {
    console.log('Creating users data...');
    const ratingsCsv = fs.readFileSync('./data/ratings.csv', 'utf8');
    const { data: ratings } = Papa.parse(ratingsCsv, {
      header: true
    });

    let userIds = ratings.map((item) => item.userId);
    userIds = [...new Set(userIds)];
    const possibleGenders = ['female', 'male'];
    const users = userIds
      .filter((userId) => !!userId)
      .map((userId) => {
        return {
          USER_ID: userId,
          GENDER:
            possibleGenders[Math.floor(Math.random() * possibleGenders.length)]
        };
      });

    fs.writeFileSync('./data/users.csv', Papa.unparse(users));
  }
};

const parse = (name, mapping = {}) => {
  const schema = fs.readFileSync(`./schema/${name}.json`, 'utf8');
  const csv = fs.readFileSync(`./data/${name}s.csv`, 'utf8');
  const { data } = Papa.parse(csv, {
    header: true
  });

  // modify data to match schema
  const dataSet = data.map((item) => {
    const newItem = {};
    Object.keys(mapping).forEach((key) => {
      const path = mapping[key];
      // if path is a function, execute it
      if (typeof path === 'function') {
        newItem[key] = path(item);
        return;
      }
      newItem[key] = JSONPath({ path: mapping[key], json: item, wrap: false });
    });
    return newItem;
  });

  return {
    schema,
    data: dataSet
  };
};

(async () => {
  const resultSets = ['movie', 'rating', 'user'];

  const jobs = resultSets.map(async (resultSet) => {
    let res;
    switch (resultSet) {
      case 'user':
        generateUsers();
        res = parse(resultSet, {
          USER_ID: '$.USER_ID',
          GENDER: '$.GENDER'
        });
        break;
      case 'movie':
        res = parse(resultSet, {
          ITEM_ID: '$.movieId',
          TITLE: '$.title',
          GENRES: '$.genres',
          YEAR: (item) => {
            const year = item.title.match(/.*\((.*)\).*/) || [];
            return year[1] || '';
          },
          CREATION_TIMESTAMP: () => Date.now()
        });
        break;
      case 'rating':
        res = parse(resultSet, {
          ITEM_ID: '$.movieId',
          USER_ID: '$.userId',
          EVENT_TYPE: () => 'RATING',
          // EVENT_VALUE: (item) => +item.rating,
          EVENT_VALUE: '$.rating',
          TIMESTAMP: () => Date.now()
        });
        break;
      default:
        break;
    }

    if (res) {
      const { schema, data } = res;
      const importer = new Importer({
        host: HOST,
        port: PORT,
        schema: JSON.parse(schema),
        data,
        deleteBeforeImport: true
      });

      return importer.start();
    }
  });

  await Promise.all(jobs);
})();
