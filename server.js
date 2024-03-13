const express = require('express');
const morgan = require('morgan');
const { createRequestHandler } = require('@remix-run/express');
const request = require('request');
const amqp = require('amqplib');
var Agenda = require('agenda');
var Agendash = require('agendash');
require('dotenv').config();

let app = express();

// create agenda dashboard route
const CONNECTION_URL = process.env.MONGO_DB_CONNECTION_URL;
let agendaConnectionConfig = {
    db: {
        address: `${CONNECTION_URL}`
    }
};
let agenda = new Agenda(agendaConnectionConfig);
app.use('/dash', Agendash(agenda));

app.use(express.static('./build'));

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

const scheduleJob = () => {
    request(`http://localhost:3000/api/v1/job`, function (error, response, body) {
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    });
};

const cancelJob = (jobId) => {
    request(
        `http://localhost:3000/api/v1/job?job_action=cancel_job&job_id=${jobId}`,
        function (error, response, body) {
            console.log('statusCode:', response && response.statusCode, 'HIT CANCEL ROUTE'); // Print the response status code if a response was received
        }
    );
};

app.listen(port, () => {
    console.log(`Express server started on http://${host}:${port}`);

    request(
        `http://localhost:3000/api/v1/job?job_action=start_service`,
        function (error, response, body) {
            console.log('statusCode:', response && response.statusCode, 'agenda service started'); // Print the response status code if a response was received
        }
    );

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
                    let messageContent = message.content.toString();
                    console.log(" [x] Received '%s'", message.content.toString());

                    let messageJSON;

                    try {
                        messageJSON = JSON.parse(message.content.toString());
                        console.log('messageJSON:', messageJSON);
                    } catch (error) {
                        console.log('ERROR while parsing message content');
                    }

                    if (messageJSON.action === 'cancel') {
                        cancelJob(messageJSON.productId);
                    } else if (messageJSON.action === 'schedule') {
                        scheduleJob();
                    }
                },
                { noAck: true }
            );

            console.log(' [*] Waiting for messages. To exit press CTRL+C');
        } catch (err) {
            console.warn(err);
        }
    })();
});
