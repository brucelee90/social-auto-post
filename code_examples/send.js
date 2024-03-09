const amqp = require('amqplib');

const QUEUE = 'post_schedule';
const text = 'Hello World!';

(async () => {
    let connection;
    try {
        connection = await amqp.connect('amqps://localhost');
        const channel = await connection.createChannel();

        await channel.assertQueue(QUEUE, { durable: false });

        // NB: `sentToQueue` and `publish` both return a boolean
        // indicating whether it's OK to send again straight away, or
        // (when `false`) that you should wait for the event `'drain'`
        // to fire before writing again. We're just doing the one write,
        // so we'll ignore it.
        channel.sendToQueue(QUEUE, Buffer.from(text));
        console.log(" [x] Added To post_schedule '%s'", text);
        await channel.close();
    } catch (err) {
        console.warn(err);
    } finally {
        if (connection) await connection.close();
    }
})();
