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
import { InstagramPostDetails } from './global_utils/types';
import checkLoginStatus, { handleFBLogin } from '../components/FacebookSDK';
import { useEffect, useState } from 'react';

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
        allFinishedJobs: allFinishedJobs,
        FB_APP_ID: process.env.FB_APP_ID,
        FB_APP_SECRET: process.env.FB_APP_SECRET
    };
}

export async function loader({ request }: LoaderFunctionArgs) {
    const { session } = await authenticate.admin(request);
    const { id: sessionId } = session;
    let igRes;

    try {
        const [sessionData, allFinishedJobs, shopSettings] = await Promise.all([
            scheduledQueueService.getAllScheduledItems(sessionId),
            jobService.getAllfinishedJobs(sessionId),
            shopSettingsService.getShopSettings(sessionId)
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
    const { igRes, allScheduledItems, allFinishedJobs, FB_APP_ID, FB_APP_SECRET } =
        useLoaderData<typeof loader>();

    let allScheduledItemsArr = [{}] as PostScheduleQueue[];
    if (allScheduledItems != undefined) {
        allScheduledItemsArr = JSON.parse(JSON.stringify(allScheduledItems)) as PostScheduleQueue[];
    }

    const [status, setStatus] = useState<string | null>(null);
    const [userData, setUserData] = useState<any>(null);
    const [accessToken, setAccessToken] = useState<any>(null);

    useEffect(() => {
        let accessToken = localStorage.getItem('fbAccessToken');
        setAccessToken(accessToken);
        console.log(accessToken);
    }, []);

    const handleLogin = () => {
        handleFBLogin(async (response) => {
            console.log('----RESPONSE----:', response);

            const shortLivedToken = response.authResponse.accessToken;
            const longLivedToken = await exchangeForLongLivedToken(shortLivedToken);

            // localStorage.setItem('fbAccessToken', longLivedToken);

            const result = await fetch('/api/v1/accesstoken', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data: {
                        fbAccessToken: longLivedToken,
                        sessionId: 'offline_l4-dev-shop.myshopify.com'
                    }
                })
            });

            const resultJson = await result.json();
            console.log('Result:', resultJson);

            if (response.status === 'connected') {
                setStatus('Logged in');
                fetchUserData();
            } else {
                setStatus('Not logged in');
            }
        });
    };

    const exchangeForLongLivedToken = async (shortLivedToken: string) => {
        // const YOUR_APP_ID = '7494338054013588';
        // const YOUR_APP_SECRET = 'c4e3594d348454f9fa3bc03319cd113b';

        // console.log('FB APP ID', `${process.env.FB_APP_ID}`);

        const response = await fetch(
            `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${FB_APP_ID}&client_secret=${FB_APP_SECRET}&fb_exchange_token=${shortLivedToken}`
        );
        const data = await response.json();
        return data.access_token;
    };

    const fetchUserData = () => {
        window.FB.api('/me', { fields: 'name,email' }, function (response: any) {
            setUserData(response);
        });
    };

    return (
        <>
            status:
            {accessToken}
            {/* <button onClick={handleCheckStatus}>Check Facebook Login Status</button> */}
            <button onClick={handleLogin}>Login with Facebook</button>
            <div>You are connected with: {igRes?.username} </div>
            <ul>
                <li>{igRes?.followers_count} Follower</li>
                <li>{igRes?.follows_count} Follows</li>
                <li>{igRes?.media_count} Bilder hochgeladen</li>
            </ul>
            <hr />
            <div>Your Schedule Queue</div>
            <table>
                <thead>
                    <tr>
                        <td>image</td>
                        <td>description:</td>
                        <td>posted at:</td>
                        <td>Post Status:</td>
                    </tr>
                </thead>
                {allScheduledItemsArr.length && (
                    <>
                        {allScheduledItemsArr?.map((scheduledItem: PostScheduleQueue, key) => {
                            let scheduledItemPostDetailsJSON: InstagramPostDetails = JSON.parse(
                                JSON.stringify(scheduledItem.postDetails)
                            );
                            let scheduleDate = moment(scheduledItem.dateScheduled).format(
                                'dddd, YYYY-MM-DD [at] hh:mma'
                            );

                            console.log(
                                'scheduledItemPostDetailsJSON',
                                scheduledItemPostDetailsJSON.postImgUrl.split(';')[0]
                            );

                            return (
                                <tr key={key}>
                                    <td>
                                        <img
                                            src={
                                                scheduledItemPostDetailsJSON.postImgUrl.split(
                                                    ';'
                                                )[0]
                                            }
                                            height="100"
                                            width="150"
                                        />
                                    </td>
                                    <td style={{ width: '10rem' }}>
                                        {scheduledItemPostDetailsJSON.postDescription}
                                    </td>
                                    <td style={{ width: '20rem' }}>{scheduleDate}</td>
                                    <td>{scheduledItem.scheduleStatus}</td>
                                </tr>
                            );
                        })}
                    </>
                )}
            </table>
            <hr />
            <div>ALL FINISHED JOBS:</div>
            <table>
                <thead>
                    <tr>
                        <td>image</td>
                        <td>description:</td>
                        <td>posted at:</td>
                    </tr>
                </thead>
                {allFinishedJobs.map(
                    (
                        job: {
                            id: string | undefined;
                            name: string;
                            imgUrl: string;
                            postDescription: string;
                            nextRunAt: Date | null;
                            lastFinishedAt: Date | undefined;
                            failedAt: Date | undefined;
                        },
                        key: any
                    ) => {
                        let lastFinishedAt = moment(job.lastFinishedAt).format(
                            'dddd, YYYY-MM-DD [at] hh:mma'
                        );
                        return (
                            <tr key={key}>
                                <td>
                                    <img src={job.imgUrl} height="100" width="150" />
                                </td>

                                <td style={{ width: '10rem' }}>{job.postDescription}</td>
                                <td style={{ width: '20rem' }}>{lastFinishedAt.toString()}</td>
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
