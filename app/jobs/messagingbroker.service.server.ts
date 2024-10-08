
import jobService from "./job.service.server";

const amqp = require('amqplib');
const QUEUE = "post_queue"
const CONNECTION_URL = process.env.AMQPS_CONNECTION_URL as string

interface MessageBrokerService {
    addItemToQueue: (messageText: string) => Promise<void>,
}

const messageBrokerService = {} as MessageBrokerService

messageBrokerService.addItemToQueue = async function (messageText: string) {
    let connection;
    try {
        connection = await amqp.connect(CONNECTION_URL);
        const channel = await connection.createChannel();

        await channel.assertQueue(QUEUE, { durable: true });


        // NB: `sentToQueue` and `publish` both return a boolean
        // indicating whether it's OK to send again straight away, or
        // (when `false`) that you should wait for the event `'drain'`
        // to fire before writing again. We're just doing the one write,
        // so we'll ignore it.
        channel.sendToQueue(QUEUE, Buffer.from(messageText));
        console.log(` [x] Added To ${QUEUE}; ${messageText} `);
        await channel.close();
    } catch (err) {
        console.warn(err);
    } finally {
        if (connection) await connection.close();
    }
}

export default messageBrokerService;
