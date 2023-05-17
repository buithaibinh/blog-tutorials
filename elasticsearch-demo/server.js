// build a proxy server to handle requests from the client

const express = require('express');

const app = express();
const port = 3000;

const bodyParser = require('body-parser');

app.use(bodyParser.json());

// elastic search client
const { Client } = require('@elastic/elasticsearch');

const client = new Client({ node: 'http://localhost:9200' });

// api routes
app.post('/api/search', (req, res) => {
  const { query } = req.body;

  client
    .search({
      index: 'books',
      body: {
        query: {
          match: {
            title: query
          }
        }
      }
    })
    .then((results) => {
      res.send(results.body.hits.hits);
    })
    .catch((err) => {
      console.log(err);
      res.send([]);
    });
});
