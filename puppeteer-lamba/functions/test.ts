import { handler } from './index';

(() => {
    console.log('Starting test');
    handler(null).then((result) => {
        console.log('Result: ', result);
    }).catch((error) => {
        console.log('Error: ', error);
    });
})();
