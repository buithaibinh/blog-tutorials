import { Client } from '@elastic/elasticsearch';

const client = new Client({ node: 'http://localhost:9200' });

const main = async () => {
  const indexName = 'jp-full-text-search';

  // delete index if exists
  await client.indices.delete({ index: indexName }, { ignore: [404] });
  console.log('deleted index');

  // create index
  await client.indices.create({
    index: indexName,
    body: {
      settings: {
        analysis: {
          char_filter: {
            normalize: {
              type: 'icu_normalizer',
              name: 'nfkc',
              mode: 'compose'
            }
          },
          tokenizer: {
            ja_kuromoji_tokenizer: {
              mode: 'search',
              type: 'kuromoji_tokenizer',
              discard_compound_token: true,
              user_dictionary_rules: [
                '東京スカイツリー,東京 スカイツリー,トウキョウ スカイツリー,カスタム名詞'
              ]
            },
            ja_ngram_tokenizer: {
              type: 'ngram',
              min_gram: 2,
              max_gram: 2,
              token_chars: ['letter', 'digit']
            }
          },
          filter: {
            ja_index_synonym: {
              type: 'synonym',
              lenient: false,
              synonyms: []
            },
            ja_search_synonym: {
              type: 'synonym_graph',
              lenient: false,
              synonyms: ['米国, アメリカ', '東京大学, 東大']
            }
          },
          analyzer: {
            ja_kuromoji_index_analyzer: {
              type: 'custom',
              char_filter: ['normalize'],
              tokenizer: 'ja_kuromoji_tokenizer',
              filter: [
                'kuromoji_baseform',
                'kuromoji_part_of_speech',
                'ja_index_synonym',
                'cjk_width',
                'ja_stop',
                'kuromoji_stemmer',
                'lowercase'
              ]
            },
            ja_kuromoji_search_analyzer: {
              type: 'custom',
              char_filter: ['normalize'],
              tokenizer: 'ja_kuromoji_tokenizer',
              filter: [
                'kuromoji_baseform',
                'kuromoji_part_of_speech',
                'ja_search_synonym',
                'cjk_width',
                'ja_stop',
                'kuromoji_stemmer',
                'lowercase'
              ]
            },
            ja_ngram_index_analyzer: {
              type: 'custom',
              char_filter: ['normalize'],
              tokenizer: 'ja_ngram_tokenizer',
              filter: ['lowercase']
            },
            ja_ngram_search_analyzer: {
              type: 'custom',
              char_filter: ['normalize'],
              tokenizer: 'ja_ngram_tokenizer',
              filter: ['ja_search_synonym', 'lowercase']
            }
          }
        }
      },
      mappings: {
        properties: {
          my_field: {
            type: 'text',
            search_analyzer: 'ja_kuromoji_search_analyzer',
            analyzer: 'ja_kuromoji_index_analyzer',
            fields: {
              ngram: {
                type: 'text',
                search_analyzer: 'ja_ngram_search_analyzer',
                analyzer: 'ja_ngram_index_analyzer'
              }
            }
          }
        }
      }
    }
  });

  // data preparation
  // bulk index documents
  const data = [
    { my_field: 'アメリカ' },
    { my_field: '米国' },
    { my_field: 'アメリカの大学' },
    { my_field: '東京大学' },
    { my_field: '帝京大学' },
    { my_field: '東京で夢の大学生活' },
    { my_field: '東京大学で夢の生活' },
    { my_field: '東大で夢の生活' },
    { my_field: '首都圏の大学 東京' }
  ];

  const docs = data.flatMap((doc, i) => [
    { index: { _index: indexName, _id: i + 1 } },
    doc
  ]);
  await client.bulk({ refresh: true, body: docs });

  // search documents
  const res = await client.search({
    index: indexName,
    body: {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: '米国',
                fields: ['my_field.ngram^1'],
                type: 'phrase'
              }
            }
          ],
          should: [
            {
              multi_match: {
                query: '米国',
                fields: ['my_field^1'],
                type: 'phrase'
              }
            }
          ]
        }
      }
    }
  });

  console.log(JSON.stringify(res, null, 2));
};

main().catch(console.log);
