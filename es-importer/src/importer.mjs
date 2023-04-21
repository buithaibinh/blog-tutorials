import { Client } from '@elastic/elasticsearch';

import ow from 'ow';

export default class Importer {
  constructor({
    host = 'localhost',
    port = 9200,
    auth,
    schema,
    data,
    deleteBeforeImport = false
  }) {
    this.client = new Client({ node: `${host}:${port}`, auth });
    this.schema = schema;
    this.data = data;
    this.deleteBeforeImport = deleteBeforeImport;

    ow(
      this.schema,
      ow.object.exactShape({
        name: ow.string,
        type: ow.optional.string,
        fields: ow.array.ofType(
          ow.object.exactShape({
            name: ow.string,
            type: ow.string,
            key: ow.optional.string,
            categorical: ow.optional.string
          })
        ),
        version: ow.optional.string
      })
    );
  }

  async start() {
    // delete index if exists
    if (this.deleteBeforeImport) {
      console.log(`Deleting index ${this.schema.name}...`);
      await this.client.indices.delete(
        { index: this.schema.name },
        { ignore: [404] }
      );
    }

    const mappings = this.schema.fields
      .filter((item) => item.categorical === 'True') // only filter categorical fields
      .reduce((acc, field) => {
        acc[field.name] = { type: field.type };
        return acc;
      }, {});

    // https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-types.html#_core_datatypes
    const indexName = this.schema.name.toLowerCase();
    const key = this.schema.fields.find((item) => item.key === 'True') || {};
    const _id = key.name || '_id';
    await this.client.indices.create(
      {
        index: indexName,
        operations: {
          mappings: mappings
        }
      },
      { ignore: [400] } // ignore 400 already exists code
    );

    const operations = this.data.flatMap((doc) => {
      return [{ index: { _index: indexName, _id: doc[_id] } }, doc];
    });

    console.log(`Importing ${this.data.length} documents...to ${indexName}`);

    const bulkResponse = await this.client.bulk({ refresh: true, operations });

    if (bulkResponse.errors) {
      const erroredDocuments = [];
      // The items array has the same order of the dataset we just indexed.
      // The presence of the `error` key indicates that the operation
      // that we did for the document has failed.
      bulkResponse.items.forEach((action, i) => {
        const operation = Object.keys(action)[0];
        if (action[operation].error) {
          erroredDocuments.push({
            // If the status is 429 it means that you can retry the document,
            // otherwise it's very likely a mapping error, and you should
            // fix the document before to try it again.
            status: action[operation].status,
            error: action[operation].error,
            operation: operations[i * 2],
            document: operations[i * 2 + 1]
          });
        }
      });
      console.log(erroredDocuments);
    }

    const count = await this.client.count({ index: indexName });
    console.log(count);
  }

  async stop() {
    await this.client.close();
  }
}
