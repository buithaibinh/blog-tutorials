import Importer from './src/importer.mjs';
import fs from 'fs';
import Papa from 'papaparse';

const HOST = 'http://localhost';
const PORT = 9200;

const parseMovies = () => {
  const schema = fs.readFileSync('./schema/movie.json', 'utf8');
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

  return {
    schema,
    data: dataSet
  };
};

const parseRatings = () => {
  const schema = fs.readFileSync('./schema/event.json', 'utf8');
  const csv = fs.readFileSync('./data/ratings.csv', 'utf8');
  const { data } = Papa.parse(csv, {
    header: true
  });

  // modify data to match schema
  const dataSet = data.map((item) => {
    return {
      ITEM_ID: item.movieId,
      USER_ID: item.userId,
      EVENT_TYPE: 'RATING',
      TIMESTAMP: Date.now()
    };
  });

  return {
    schema,
    data: dataSet
  };
};

const parseUsers = () => {
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

  const schema = fs.readFileSync('./schema/user.json', 'utf8');
  const csv = fs.readFileSync('./data/users.csv', 'utf8');
  const { data } = Papa.parse(csv, {
    header: true
  });

  // modify data to match schema
  const dataSet = data.map((item) => {
    return {
      USER_ID: item.USER_ID,
      GENDER: item.GENDER
    };
  });

  return {
    schema,
    data: dataSet
  };
};

(async () => {
  const resultSets = ['users', 'movies', 'ratings'];

  const jobs = resultSets.map(async (resultSet) => {
    let res;
    switch (resultSet) {
      case 'users':
        res = parseUsers();
        break;
      case 'movies':
        res = parseMovies();
        break;
      case 'ratings':
        res = parseRatings();
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
