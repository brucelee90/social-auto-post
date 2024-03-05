import { PassThrough } from 'stream';
import { renderToPipeableStream } from 'react-dom/server';
import { RemixServer } from '@remix-run/react';
import { createReadableStreamFromReadable, type EntryContext } from '@remix-run/node';
import { isbot } from 'isbot';
import { addDocumentResponseHeaders } from './shopify.server';
import moment from 'moment';
import {
    getScheduledItemsByDate,
    removeScheduledItemFromQueue
} from './controllers/post_schedule.server';
import { publishMedia } from './controllers/instagram.server';
const schedule = require('node-schedule');
const amqp = require('amqplib');

const ABORT_DELAY = 5000;
const QUEUE = 'post_schedule';
const CONNECTION_URL = process.env.AMQPS_URL as string;

export async function runScheduledPostsByDate(date: Date) {
    try {
        let postQueue = await getScheduledItemsByDate(date);
        // console.log('postQueue', postQueue);

        postQueue.map((el) => {
            console.log(el.productId + ' will be posted at:', el.dateScheduled);
            const publishDate = moment(el.dateScheduled).toISOString();
            schedule.scheduleJob(publishDate, function () {
                publishMedia(el.postImgUrl, el.postDescription);

                removeScheduledItemFromQueue(el.productId);

                console.log('Posted media at.', publishDate);
            });
        });

        return { error: false };
    } catch (error) {
        return { error: true };
    }
}

export default async function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    remixContext: EntryContext
) {
    addDocumentResponseHeaders(request, responseHeaders);
    const userAgent = request.headers.get('user-agent');
    const callbackName = isbot(userAgent ?? '') ? 'onAllReady' : 'onShellReady';

    return new Promise((resolve, reject) => {
        const { pipe, abort } = renderToPipeableStream(
            <RemixServer context={remixContext} url={request.url} abortDelay={ABORT_DELAY} />,
            {
                [callbackName]: () => {
                    const body = new PassThrough();
                    const stream = createReadableStreamFromReadable(body);

                    // runScheduledPostsByDate(new Date());

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
                                (message: any) => {
                                    console.log(" [x] Received '%s'", message.content.toString());
                                    runScheduledPostsByDate(new Date());
                                },
                                { noAck: true }
                            );

                            console.log(' [*] Waiting for messages. To exit press CTRL+C');
                        } catch (err) {
                            console.warn(err);
                        }
                    })();

                    responseHeaders.set('Content-Type', 'text/html');
                    resolve(
                        new Response(stream, {
                            headers: responseHeaders,
                            status: responseStatusCode
                        })
                    );
                    pipe(body);
                },
                onShellError(error) {
                    reject(error);
                },
                onError(error) {
                    responseStatusCode = 500;
                    console.error(error);
                }
            }
        );

        setTimeout(abort, ABORT_DELAY);
    });
}
