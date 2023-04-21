import Fuse from 'fuse.js';

// load json data from file
import list from './data/posts.json' assert { type: 'json' };

const run = async () => {
  const options = {
    includeScore: true,
    threshold: 0.1,
    ignoreLocation: true,
    useExtendedSearch: true,
    keys: ['title', 'description']
  };

  const query = {
    title: `福祉・介護保険`
  };

  const fuse = new Fuse(list, options); // "list" is the item array
  let result = fuse.search();

  console.log(result);
  console.log('result: ', result.length);
};

run();
