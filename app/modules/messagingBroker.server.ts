import postScheduler from "./postScheduler.server";

const amqp = require('amqplib');
const QUEUE = "post_queue"
const CONNECTION_URL = process.env.AMQPS_URL as string

const messagingBroker = {
    subscribeToMessageQueue: async function () {


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
                (message: any) => {
                    console.log(" [x] Received '%s'", message.content.toString());
                    postScheduler.runScheduledPostsByDate(new Date());
                },
                { noAck: true }
            );
            console.log(' [*] Waiting for messages. To exit press CTRL+C');
        } catch (err) {
            console.warn(err);
        }
    },

    addItemToRabbitMQPostQueue: async function (messageText: string) {
        let connection;
        try {
            connection = await amqp.connect(CONNECTION_URL);
            const channel = await connection.createChannel();

            await channel.assertQueue(QUEUE, { durable: false });


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

}

export { messagingBroker };