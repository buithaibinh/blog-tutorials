import { fromUrl, fromBufferWithMimeType, fromBuffer } from '@sk-global/text-extractor';

(async () => {
  console.log('Hello World!');
  const text = await fromUrl(
    'https://www.digital.go.jp/assets/contents/node/basic_page/field_ref_resources/d6cfdcdd-75e4-460c-9ec0-af4f952e03d5/20210906_meeting_promoting_01.pdf'
  );
  console.log(text);
})();
