import { Client } from '@elastic/elasticsearch';

const client = new Client({ node: 'http://localhost:9200' });

const main = async () => {
  // assume that we already have a videos index
  // let's create a new index for the autocomplete
  // read more how to use the reindex on my blog: https://www.codewithyou.com/blog/changing-field-types-in-elasticsearch-a-stepbystep-guide

  // Notes
  // 1. Install ICU Analysis plugin for Japanese support
  // https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-icu.html

  // 2. install kuromoji plugin for Japanese support

  const indexName = 'jp-autocomplete';

  // delete index if exists
  await client.indices.delete({ index: indexName }, { ignore: [404] });
  console.log('deleted index');

  // create a new index
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
            },
            kana_to_romaji: {
              type: 'mapping',
              mappings: [
                'あ=>a',
                'い=>i',
                'う=>u',
                'え=>e',
                'お=>o',
                'か=>ka',
                'き=>ki',
                'く=>ku',
                'け=>ke',
                'こ=>ko',
                'さ=>sa',
                'し=>shi',
                'す=>su',
                'せ=>se',
                'そ=>so',
                'た=>ta',
                'ち=>chi',
                'つ=>tsu',
                'て=>te',
                'と=>to',
                'な=>na',
                'に=>ni',
                'ぬ=>nu',
                'ね=>ne',
                'の=>no',
                'は=>ha',
                'ひ=>hi',
                'ふ=>fu',
                'へ=>he',
                'ほ=>ho',
                'ま=>ma',
                'み=>mi',
                'む=>mu',
                'め=>me',
                'も=>mo',
                'や=>ya',
                'ゆ=>yu',
                'よ=>yo',
                'ら=>ra',
                'り=>ri',
                'る=>ru',
                'れ=>re',
                'ろ=>ro',
                'わ=>wa',
                'を=>o',
                'ん=>n',
                'が=>ga',
                'ぎ=>gi',
                'ぐ=>gu',
                'げ=>ge',
                'ご=>go',
                'ざ=>za',
                'じ=>ji',
                'ず=>zu',
                'ぜ=>ze',
                'ぞ=>zo',
                'だ=>da',
                'ぢ=>ji',
                'づ=>zu',
                'で=>de',
                'ど=>do',
                'ば=>ba',
                'び=>bi',
                'ぶ=>bu',
                'べ=>be',
                'ぼ=>bo',
                'ぱ=>pa',
                'ぴ=>pi',
                'ぷ=>pu',
                'ぺ=>pe',
                'ぽ=>po',
                'きゃ=>kya',
                'きゅ=>kyu',
                'きょ=>kyo',
                'しゃ=>sha',
                'しゅ=>shu',
                'しょ=>sho',
                'ちゃ=>cha',
                'ちゅ=>chu',
                'ちょ=>cho',
                'にゃ=>nya',
                'にゅ=>nyu',
                'にょ=>nyo',
                'ひゃ=>hya',
                'ひゅ=>hyu',
                'ひょ=>hyo',
                'みゃ=>mya',
                'みゅ=>myu',
                'みょ=>myo',
                'りゃ=>rya',
                'りゅ=>ryu',
                'りょ=>ryo',
                'ぎゃ=>gya',
                'ぎゅ=>gyu',
                'ぎょ=>gyo',
                'じゃ=>ja',
                'じゅ=>ju',
                'じょ=>jo',
                'びゃ=>bya',
                'びゅ=>byu',
                'びょ=>byo',
                'ぴゃ=>pya',
                'ぴゅ=>pyu',
                'ぴょ=>pyo',
                'ふぁ=>fa',
                'ふぃ=>fi',
                'ふぇ=>fe',
                'ふぉ=>fo',
                'ふゅ=>fyu',
                'うぃ=>wi',
                'うぇ=>we',
                'うぉ=>wo',
                'つぁ=>tsa',
                'つぃ=>tsi',
                'つぇ=>tse',
                'つぉ=>tso',
                'ちぇ=>che',
                'しぇ=>she',
                'じぇ=>je',
                'てぃ=>ti',
                'でぃ=>di',
                'でゅ=>du',
                'とぅ=>tu',
                'ぢゃ=>ja',
                'ぢゅ=>ju',
                'ぢょ=>jo',
                'ぁ=>a',
                'ぃ=>i',
                'ぅ=>u',
                'ぇ=>e',
                'ぉ=>o',
                'っ=>t',
                'ゃ=>ya',
                'ゅ=>yu',
                'ょ=>yo',
                'ア=>a',
                'イ=>i',
                'ウ=>u',
                'エ=>e',
                'オ=>o',
                'カ=>ka',
                'キ=>ki',
                'ク=>ku',
                'ケ=>ke',
                'コ=>ko',
                'サ=>sa',
                'シ=>shi',
                'ス=>su',
                'セ=>se',
                'ソ=>so',
                'タ=>ta',
                'チ=>chi',
                'ツ=>tsu',
                'テ=>te',
                'ト=>to',
                'ナ=>na',
                'ニ=>ni',
                'ヌ=>nu',
                'ネ=>ne',
                'ノ=>no',
                'ハ=>ha',
                'ヒ=>hi',
                'フ=>fu',
                'ヘ=>he',
                'ホ=>ho',
                'マ=>ma',
                'ミ=>mi',
                'ム=>mu',
                'メ=>me',
                'モ=>mo',
                'ヤ=>ya',
                'ユ=>yu',
                'ヨ=>yo',
                'ラ=>ra',
                'リ=>ri',
                'ル=>ru',
                'レ=>re',
                'ロ=>ro',
                'ワ=>wa',
                'ヲ=>o',
                'ン=>n',
                'ガ=>ga',
                'ギ=>gi',
                'グ=>gu',
                'ゲ=>ge',
                'ゴ=>go',
                'ザ=>za',
                'ジ=>ji',
                'ズ=>zu',
                'ゼ=>ze',
                'ゾ=>zo',
                'ダ=>da',
                'ヂ=>ji',
                'ヅ=>zu',
                'デ=>de',
                'ド=>do',
                'バ=>ba',
                'ビ=>bi',
                'ブ=>bu',
                'ベ=>be',
                'ボ=>bo',
                'パ=>pa',
                'ピ=>pi',
                'プ=>pu',
                'ペ=>pe',
                'ポ=>po',
                'キャ=>kya',
                'キュ=>kyu',
                'キョ=>kyo',
                'シャ=>sha',
                'シュ=>shu',
                'ショ=>sho',
                'チャ=>cha',
                'チュ=>chu',
                'チョ=>cho',
                'ニャ=>nya',
                'ニュ=>nyu',
                'ニョ=>nyo',
                'ヒャ=>hya',
                'ヒュ=>hyu',
                'ヒョ=>hyo',
                'ミャ=>mya',
                'ミュ=>myu',
                'ミョ=>myo',
                'リャ=>rya',
                'リュ=>ryu',
                'リョ=>ryo',
                'ギャ=>gya',
                'ギュ=>gyu',
                'ギョ=>gyo',
                'ジャ=>ja',
                'ジュ=>ju',
                'ジョ=>jo',
                'ビャ=>bya',
                'ビュ=>byu',
                'ビョ=>byo',
                'ピャ=>pya',
                'ピュ=>pyu',
                'ピョ=>pyo',
                'ファ=>fa',
                'フィ=>fi',
                'フェ=>fe',
                'フォ=>fo',
                'フュ=>fyu',
                'ウィ=>wi',
                'ウェ=>we',
                'ウォ=>wo',
                'ヴァ=>va',
                'ヴィ=>vi',
                'ヴ=>v',
                'ヴェ=>ve',
                'ヴォ=>vo',
                'ツァ=>tsa',
                'ツィ=>tsi',
                'ツェ=>tse',
                'ツォ=>tso',
                'チェ=>che',
                'シェ=>she',
                'ジェ=>je',
                'ティ=>ti',
                'ディ=>di',
                'デュ=>du',
                'トゥ=>tu',
                'ヂャ=>ja',
                'ヂュ=>ju',
                'ヂョ=>jo',
                'ァ=>a',
                'ィ=>i',
                'ゥ=>u',
                'ェ=>e',
                'ォ=>o',
                'ッ=>t',
                'ャ=>ya',
                'ュ=>yu',
                'ョ=>yo'
              ]
            }
          },
          tokenizer: {
            kuromoji_normal: {
              mode: 'normal',
              type: 'kuromoji_tokenizer'
            }
          },
          filter: {
            readingform: {
              type: 'kuromoji_readingform',
              use_romaji: true
            },
            edge_ngram: {
              type: 'edge_ngram',
              min_gram: 1,
              max_gram: 10
            },
            synonym: {
              type: 'synonym',
              lenient: true,
              synonyms: ['nippon, nihon']
            }
          },
          analyzer: {
            suggest_index_analyzer: {
              type: 'custom',
              char_filter: ['normalize'],
              tokenizer: 'kuromoji_normal',
              filter: ['lowercase', 'edge_ngram']
            },
            suggest_search_analyzer: {
              type: 'custom',
              char_filter: ['normalize'],
              tokenizer: 'kuromoji_normal',
              filter: ['lowercase']
            },
            readingform_index_analyzer: {
              type: 'custom',
              char_filter: ['normalize', 'kana_to_romaji'],
              tokenizer: 'kuromoji_normal',
              filter: [
                'lowercase',
                'readingform',
                'asciifolding',
                'synonym',
                'edge_ngram'
              ]
            },
            readingform_search_analyzer: {
              type: 'custom',
              char_filter: ['normalize', 'kana_to_romaji'],
              tokenizer: 'kuromoji_normal',
              filter: ['lowercase', 'readingform', 'asciifolding', 'synonym']
            }
          }
        }
      },
      mappings: {
        properties: {
          my_field: {
            type: 'keyword',
            fields: {
              suggest: {
                type: 'text',
                search_analyzer: 'suggest_search_analyzer',
                analyzer: 'suggest_index_analyzer'
              },
              readingform: {
                type: 'text',
                search_analyzer: 'readingform_search_analyzer',
                analyzer: 'readingform_index_analyzer'
              }
            }
          }
        }
      }
    }
  });

  // bulk index documents
  const data = [
    { my_field: '日本', created: '2016-11-11T11:11:11' },
    { my_field: '日本', created: '2017-11-11T11:11:11' },
    { my_field: '日本', created: '2018-11-11T11:11:11' },
    { my_field: '日本', created: '2019-11-11T11:11:11' },
    { my_field: '日本', created: '2020-11-11T11:11:11' },
    { my_field: '日本', created: '2020-11-11T11:11:11' },
    { my_field: '日本 地図', created: '2020-04-07T12:00:00' },
    { my_field: '日本 地図', created: '2020-03-11T12:00:00' },
    { my_field: '日本 地図', created: '2020-04-07T12:00:00' },
    { my_field: '日本 地図', created: '2020-04-07T12:00:00' },
    { my_field: '日本 地図', created: '2020-04-07T12:00:00' },
    { my_field: '日本 郵便', created: '2020-04-07T12:00:00' },
    { my_field: '日本 郵便', created: '2020-04-07T12:00:00' },
    { my_field: '日本 郵便', created: '2020-04-07T12:00:00' },
    { my_field: '日本の人口', created: '2020-04-07T12:00:00' },
    { my_field: '日本の人口', created: '2020-04-07T12:00:00' },
    { my_field: '日本 代表', created: '2020-04-07T12:00:00' }
  ];

  const docs = data.flatMap((doc, i) => [
    { index: { _index: indexName, _id: i + 1 } },
    doc
  ]);

  await client.bulk({ body: docs });

  // refresh index
  await client.indices.refresh({ index: indexName });

  const searchResult1 = await client.search({
    index: indexName,
    body: {
      size: 0,
      query: {
        bool: {
          should: [
            {
              match: {
                'my_field.suggest': {
                  query: '日本'
                }
              }
            },
            {
              match: {
                'my_field.readingform': {
                  query: '日本',
                  fuzziness: 'AUTO',
                  operator: 'and'
                }
              }
            }
          ]
        }
      },
      aggs: {
        keywords: {
          terms: {
            field: 'my_field',
            order: {
              _count: 'desc'
            },
            size: '10'
          }
        }
      }
    }
  });

  console.log('Search keyword is "日本"');
  console.log(JSON.stringify(searchResult1, null, 2));
};

main().catch(console.log);
