const amqp = require('amqplib');

const QUEUE = 'post_schedule';


export async function addItemToRabbitMQPostQueue(messageText: string) {
    let connection;
    try {
        connection = await amqp.connect(
            'amqps://unmsawam:3yFMd757D_ziB7S-w55gtixr4MIqztNk@sparrow.rmq.cloudamqp.com/unmsawam'
        );
        const channel = await connection.createChannel();

        await channel.assertQueue(QUEUE, { durable: false });

        // NB: `sentToQueue` and `publish` both return a boolean
        // indicating whether it's OK to send again straight away, or
        // (when `false`) that you should wait for the event `'drain'`
        // to fire before writing again. We're just doing the one write,
        // so we'll ignore it.
        channel.sendToQueue(QUEUE, Buffer.from(messageText));
        console.log(" [x] Added To post_schedule '%s'", messageText);
        await channel.close();
    } catch (err) {
        console.warn(err);
    } finally {
        if (connection) await connection.close();
    }
};
