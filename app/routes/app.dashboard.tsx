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

interface IgRes {
    error: boolean;
    message: string;
    username: string;
    followers_count: string;
    follows_count: string;
    media_count: string;
}

function createApiResponse(error: boolean, message: string) {
    return {
        error: error,
        message: message
    };
}

export async function loader({ request }: LoaderFunctionArgs) {
    const { session } = await authenticate.admin(request);
    const { id: sessionId } = session;
    let igRes;
    let apiResponse;
    let serializedScheduledItems;

    try {
        const [sessionData] = await Promise.all([
            scheduledQueueService.getAllScheduledItems(sessionId)
        ]);

        serializedScheduledItems = sessionData.postScheduleQueue.map((item) => ({
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
        }
        apiResponse = createApiResponse(false, 'Connected Successfully');
        throw new Error('ACCESS TOKEN UND PAGE ID ÜBRERPRÜFEN!');
    } catch (error) {
        console.log('Something went wrong');
        apiResponse = createApiResponse(true, 'An error Occured:' + error);
    }

    return {
        igRes: igRes,
        apiResponse: apiResponse,
        allScheduledItems: serializedScheduledItems
    };
}

function Dashboard() {
    const { igRes, allScheduledItems } = useLoaderData<typeof loader>();

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

            {allScheduledItemsArr.length ? (
                <>
                    <div>Your Schedule Queue</div>
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
            ) : (
                <div>
                    It looks empty in here. Go ahead and{' '}
                    <Link to="/app/schedule">schedule some of your Products</Link>
                    And create some custom placeholder under your settings sections
                    <Link to="/app/settings">Settings</Link>{' '}
                </div>
            )}
        </>
    );
}

export default Dashboard;
