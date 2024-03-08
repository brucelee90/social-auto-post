const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const { createRequestHandler } = require('@remix-run/express');
var request = require('request');
const amqp = require('amqplib');

const QUEUE = 'post_queue';
const CONNECTION_URL = process.env.AMQPS_URL;

let app = express();

app.use(express.static('public'));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.all(
    '*',
    createRequestHandler({
        build: require('./build/index.js'),
        getLoadContext(req, res) {
            return { req, res };
        }
    })
);

let port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Express server started on http://localhost:${port}`);

    (async () => {
        try {
            const connection = await amqp.connect(CONNECTION_URL);
            const channel = await connection.createChannel();

            process.once('SIGINT', async () => {
                await channel.close();
                await connection.close();
            });

            await channel.assertQueue(QUEUE, { durable: false });
            await channel.consume(
                QUEUE,
                (message) => {
                    console.log(" [x] Received '%s'", message.content.toString());

                    request(
                        'http://localhost:3000/api/v1/schedule',
                        function (error, response, body) {
                            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                        }
                    );
                },
                { noAck: true }
            );

            console.log(' [*] Waiting for messages. To exit press CTRL+C');
        } catch (err) {
            console.warn(err);
        }
    })();
});
