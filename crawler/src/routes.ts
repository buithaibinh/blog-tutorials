import { Dataset, createCheerioRouter } from 'crawlee';

export const router = createCheerioRouter();

router.addDefaultHandler(async ({ enqueueLinks, log, request, $ }) => {
  console.log('enqueueing new URLs', $.html());
  await enqueueLinks({
    globs: ['https://crawlee.dev/**'],
    label: 'detail'
  });
});

router.addHandler('detail', async ({ request, $, log }) => {
  const title = $('title').text();
  log.info(`${title}`, { url: request.loadedUrl });

  await Dataset.pushData({
    url: request.loadedUrl,
    title
  });
});
