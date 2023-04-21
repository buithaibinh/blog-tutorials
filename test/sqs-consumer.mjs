import { Consumer } from 'sqs-consumer';


const queueUrl = 'https://sqs.ap-southeast-1.amazonaws.com/820710015775/skg-development';

async function main() {
    const app = Consumer.create({
        queueUrl,
        region: 'ap-southeast-1',
        handleMessage: async (message) => {
            // do some work with `message`
            console.log(message);
            // Messages are deleted from the queue once the handler function has completed successfully
            // stop processing messages after 10
            //   app.stop();
        },
    });

    app.on('error', (err) => {
        console.error(err.message);
    });

    app.on('processing_error', (err) => {
        console.error(err.message);
    });

    app.start();
}

main();
