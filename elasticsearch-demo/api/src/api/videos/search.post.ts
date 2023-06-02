import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: process.env.ELASTICSEARCH_HOST
});

export default eventHandler(async (event) => {
  const body = await readBody(event);
  const { query } = body;
  console.log(body);
  // await useStorage('db').setItem('foo', { hello: 'world' });

  const searchResult = await client.search({
    index: process.env.ELASTICSEARCH_INDEX,
    body: {
      query
    }
  });

  console.log(searchResult);
  // TODO: Handle body and add user
  return { updated: true, searchResult };
});
