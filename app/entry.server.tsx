import { PassThrough } from 'stream';
import { renderToPipeableStream } from 'react-dom/server';
import { RemixServer } from '@remix-run/react';
import { createReadableStreamFromReadable, type EntryContext } from '@remix-run/node';
import { isbot } from 'isbot';
import { addDocumentResponseHeaders } from './shopify.server';
import moment from 'moment';
import { getScheduledItemsByDate } from './controllers/post_schedule.server';
import { publishMedia } from './controllers/instagram.server';
const schedule = require('node-schedule');
const nodeCron = require('node-cron');

const ABORT_DELAY = 5000;

export async function runScheduledPostsByDate(date: Date) {
    // console.log('wait...', await getScheduledItemsByDate(new Date()));
    try {
        let postQueue = await getScheduledItemsByDate(date);
        // console.log('postQueue', postQueue);

        postQueue.map((el) => {
            console.log('post queue el', el.dateScheduled);

            const publishDate = moment(el.dateScheduled).toISOString();

            schedule.scheduleJob(publishDate, function () {
                console.log('Post media at.', publishDate);
                publishMedia(
                    'https://cdn.shopify.com/s/files/1/0585/4239/1487/files/air-jordan-5-aqua-mrkicks-2.png?v=1708688484',
                    'Scheduled Post Works as well'
                );
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

                    // const job = nodeCron.schedule('* * * * * *', function jobYouNeedToExecute() {
                    // Do whatever you want in here. Send email, Make  database backup or download data.
                    // console.log(new Date().toLocaleString());
                    runScheduledPostsByDate(new Date());
                    // });

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
