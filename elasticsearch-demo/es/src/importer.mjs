import { Client } from '@elastic/elasticsearch';

import ow from 'ow';

const getAnalysis = () => {
  return {
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
  };
};
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

    // ow(
    //   this.schema,
    //   ow.object.exactShape({
    //     name: ow.string,
    //     type: ow.optional.string,
    //     fields: ow.array.ofType(
    //       ow.object.exactShape({
    //         name: ow.string,
    //         type: ow.string,
    //         key: ow.optional.string,
    //         categorical: ow.optional.string,
    //         fields: ow.optional.exactShape({
    //           name: ow.string,
    //         }),
    //       })
    //     ),
    //     version: ow.optional.string
    //   })
    // );
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
        acc[field.name] = { type: field.type, fields: field.fields };
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
          settings: {
            analysis: getAnalysis()
          },
          mappings: mappings
        }
      },
      { ignore: [400] } // ignore 400 already exists code
    );

    const operations = this.data.flatMap((doc) => {
      return [{ index: { _index: indexName, _id: doc[_id] } }, doc];
      // return [{ index: { _index: indexName, } }, doc];
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
