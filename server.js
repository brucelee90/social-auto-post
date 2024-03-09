const express = require('express');
const morgan = require('morgan');
const { createRequestHandler } = require('@remix-run/express');
const request = require('request');
const amqp = require('amqplib');

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

let host = process.env.HOST || 'localhost';
let port = process.env.PORT || 3000;

const createPostSchedule = () => {
    request('http://localhost:3000/api/v1/schedule', function (error, response, body) {
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    });
};

app.listen(port, () => {
    console.log(`Express server started on http://${host}:${port}`);

    (async () => {
        try {
            const connection = await amqp.connect(process.env.AMQPS_CONNECTION_URL);
            const channel = await connection.createChannel();

            process.once('SIGINT', async () => {
                await channel.close();
                await connection.close();
            });

            await channel.assertQueue(process.env.AMQPS_QUEUE, { durable: false });
            await channel.consume(
                process.env.AMQPS_QUEUE,
                (message) => {
                    console.log(" [x] Received '%s'", message.content.toString());
                    createPostSchedule();
                },
                { noAck: true }
            );

            console.log(' [*] Waiting for messages. To exit press CTRL+C');
        } catch (err) {
            console.warn(err);
        }
    })();
});
