// For more information, see https://crawlee.dev/
import { CheerioCrawler, ProxyConfiguration } from 'crawlee';
import { router } from './routes.js';

const startUrls = ['https://www.city.anjo.aichi.jp/event.xml'];

const crawler = new CheerioCrawler({
    // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
    requestHandler: router,
});

await crawler.run(startUrls);
