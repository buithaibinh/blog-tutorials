import axios from 'axios';

const url = 'https://www.city.anjo.aichi.jp/shisei/shinchaku.xml';

axios
  .get(url, {
    insecureHTTPParser: true
  })
  .then((response) => {
    console.log(response.data);
  });
