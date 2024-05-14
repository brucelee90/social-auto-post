import { GetPageInfoRequest, PageField } from 'instagram-graph-api';
import { Link, useLoaderData } from '@remix-run/react';
import { LoaderFunctionArgs } from '@remix-run/server-runtime';
import { authenticate } from '~/shopify.server';
import { queries } from '~/utils/queries';
import { shopSettingsService } from '~/services/SettingsService.server';
import postScheduleQueueService, {
    scheduledQueueService
} from '~/jobs/schedulequeue.service.server';
import { PostScheduleQueue } from '@prisma/client';
import { Agenda, Job } from '@hokify/agenda';
import jobService from '~/jobs/job.service.server';
import moment from 'moment';

interface IgRes {
    error: boolean;
    message: string;
    username: string;
    followers_count: string;
    follows_count: string;
    media_count: string;
}

function createApiResponse(
    error: boolean,
    message: string,
    igRes: any = null,
    allScheduledItems: any = null,
    allFinishedJobs: any = null
) {
    return {
        error: error,
        message: message,
        igRes: igRes,
        allScheduledItems: allScheduledItems,
        allFinishedJobs: allFinishedJobs
    };
}

export async function loader({ request }: LoaderFunctionArgs) {
    const { session } = await authenticate.admin(request);
    const { id: sessionId } = session;
    let igRes;

    try {
        const [sessionData, allFinishedJobs] = await Promise.all([
            scheduledQueueService.getAllScheduledItems(sessionId),
            jobService.getAllfinishedJobs(sessionId)
        ]);

        let serializedScheduledItems = sessionData.postScheduleQueue.map((item) => ({
            ...item,
            productId: Number(item.productId)
        }));

        if (process.env.ACCESS_TOKEN && process.env.PAGE_ID != undefined) {
            const request: GetPageInfoRequest = new GetPageInfoRequest(
                process.env.ACCESS_TOKEN,
                process.env.PAGE_ID,
                ...[
                    PageField.FOLLOWERS_COUNT,
                    PageField.FOLLOWS_COUNT,
                    PageField.MEDIA_COUNT,
                    PageField.NAME,
                    PageField.USERNAME
                ]
            );

            igRes = (await request.execute()).getData();
        } else {
            throw new Error('ACCESS TOKEN UND PAGE ID ÜBRERPRÜFEN!');
        }
        return createApiResponse(false, '', igRes, serializedScheduledItems, allFinishedJobs);
    } catch (error) {
        console.log('Something went wrong on dashboard', error);
        return createApiResponse(true, 'An error Occured:' + error);
    }
}

function Dashboard() {
    const { igRes, allScheduledItems, allFinishedJobs } = useLoaderData<typeof loader>();

    let allScheduledItemsArr = [{}] as PostScheduleQueue[];
    if (allScheduledItems != undefined) {
        allScheduledItemsArr = JSON.parse(JSON.stringify(allScheduledItems)) as PostScheduleQueue[];
    }

    return (
        <>
            <div>You are connected with: {igRes?.username} </div>
            <ul>
                <li>{igRes?.followers_count} Follower</li>
                <li>{igRes?.follows_count} Follows</li>
                <li>{igRes?.media_count} Bilder hochgeladen</li>
            </ul>

            <hr />

            <div>Your Schedule Queue</div>
            {allScheduledItemsArr.length && (
                <>
                    <ul>
                        {allScheduledItemsArr?.map((scheduledItem: PostScheduleQueue) => {
                            return (
                                <li>
                                    {Number(scheduledItem.productId)}:{' '}
                                    {scheduledItem.scheduleStatus}
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}

            <hr />

            <div>ALL FINISHED JOBS:</div>
            <table>
                <thead>
                    <tr>
                        <td>image</td>
                        <td>posted at:</td>
                        <td>description:</td>
                    </tr>
                </thead>
                {allFinishedJobs.map(
                    (job: {
                        id: string | undefined;
                        name: string;
                        imgUrl: string;
                        postDescription: string;
                        nextRunAt: Date | null;
                        lastFinishedAt: Date | undefined;
                        failedAt: Date | undefined;
                    }) => {
                        let lastFinishedAt = moment(job.lastFinishedAt);
                        return (
                            <tr>
                                <td>
                                    <img src={job.imgUrl} height="100" width="150" />
                                </td>

                                <td>{lastFinishedAt.toString()}</td>
                                <td>{job.postDescription}</td>
                            </tr>
                        );
                    }
                )}
            </table>
            <hr />
        </>
    );
}

export default Dashboard;
