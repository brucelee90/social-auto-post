import { string } from "yup";
import { action } from "~/routes/api.v1.job/route";

const express = require('express');
const morgan = require('morgan');
const { createRequestHandler } = require('@remix-run/express');
const request = require('request');
const amqp = require('amqplib');
var Agenda = require('agenda');
var Agendash = require('agendash');

require('dotenv').config();

let app = express();

let host = process.env.HOST || 'localhost';
let port = process.env.EXPRESS_PORT || 4000;

app.use(express.static('./build'));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.all(
    '*',
    createRequestHandler({
        build: require('./build/index.js'),
        getLoadContext(req: any, res: any) {
            return { req, res };
        }
    })
);

const scheduleJob = (jobId: string, sessionId: string) => {
    // THIS NEEDS REFACTORING !!!
    // THERE SHOULD BE POST REQUEST, MAKING IT POSSIBLE TO SEND A DESCRIPTION AS WELL
    setTimeout(() => {
        request(
            `http://${host}:${port}/api/v1/job?job_action=schedule_job&job_id=${jobId}&shop_name=${sessionId}`,
            function (response: { statusCode: string }) {
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            }
        );
    }, 5500)
};

const cancelJob = (jobId: string) => {
    request(
        `http://${host}:${port}/api/v1/job?job_action=cancel_job&job_id=${jobId}`,
        function (response: { statusCode: string }) {
            console.log('statusCode:', response && response.statusCode, 'HIT CANCEL ROUTE'); // Print the response status code if a response was received
        }
    );
};

app.listen(port, () => {
    console.log(`Express server started on http://${host}:${port}`);

    request(
        `http://${host}:${port}/api/v1/job?job_action=start_job_service`,
        function (response: { statusCode: string }) {
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


            await channel.assertQueue(process.env.AMQPS_QUEUE, { durable: true });
            await channel.consume(
                process.env.AMQPS_QUEUE,
                (message: { content: string }) => {
                    let messageContent = message.content.toString();
                    console.log(" [x] Received '%s'", message.content.toString());

                    let messageJSON: { action: string, productId: string, sessionId: string };

                    try {
                        messageJSON = JSON.parse(message.content.toString());
                        console.log('messageJSON:', messageJSON);

                        if (messageJSON.action === 'cancel') {
                            cancelJob(messageJSON.productId);
                        } else if (messageJSON.action === 'schedule') {

                            setTimeout(() => {
                                scheduleJob(messageJSON.productId, messageJSON.sessionId);
                            }, 2500)

                        }
                        channel.ack(message);

                    } catch (error) {
                        console.log('ERROR while parsing message content');
                    }
                },
                { noAck: false }
            );

            console.log(' [*] Waiting for messages. To exit press CTRL+C');
        } catch (err) {
            console.warn(err);
        }
    })();
});
