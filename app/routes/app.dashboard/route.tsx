import {
    GetAuthorizedFacebookPagesRequest,
    GetAuthorizedFacebookPagesResponse,
    GetPageInfoRequest,
    PageField
} from 'instagram-graph-api';
import { useLoaderData } from '@remix-run/react';
import { LoaderFunctionArgs } from '@remix-run/server-runtime';
import { authenticate } from '~/shopify.server';
import { shopSettingsService } from '~/services/SettingsService.server';
import { scheduledQueueService } from '~/jobs/schedulequeue.service.server';
import { PostScheduleQueue } from '@prisma/client';
import jobService from '~/jobs/job.service.server';
import moment from 'moment';
import { InstagramPostDetails } from '../global_utils/types';
import { handleFBLogin } from '../../components/FacebookSDK';

import { ActionFunctionArgs } from '@remix-run/node';
import { useSubmit } from '@remix-run/react';
import { Badge, BlockStack, Divider, Page, Text } from '@shopify/polaris';
import { FbAccountConnection } from './FbAccountConnection';
import { PostTable } from './PostTable';

enum FormNames {
    fbAccessToken = 'fb_access_token',
    fbPageId = 'fb_page_id'
}

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
    allFinishedJobs: any = null,
    sessionId: any = null,
    facebookAccessToken: any = null,
    fbPageId: any = null
) {
    return {
        error: error,
        message: message,
        igRes: igRes,
        allScheduledItems: allScheduledItems,
        allFinishedJobs: allFinishedJobs,
        sessionId: sessionId,
        fbAccessToken: facebookAccessToken,
        fbPageId: '',
        FB_APP_ID: process.env.FB_APP_ID,
        FB_APP_SECRET: process.env.FB_APP_SECRET
    };
}

async function getFirstFacebookPage(fbAccessToken: string) {
    try {
        const fBreq: GetAuthorizedFacebookPagesRequest = new GetAuthorizedFacebookPagesRequest(
            fbAccessToken
        );
        const pagesResponse: GetAuthorizedFacebookPagesResponse = await fBreq.execute();
        const facebookPage = await pagesResponse.getAuthorizedFacebookPages()[0].id;
        return facebookPage;
    } catch (error) {
        console.log('DAMN, error in getFirstFacebookPage', error);
    }
}

async function getInstagramAccountForPage(fbPageId: string, accessToken: string) {
    const response = await fetch(
        `https://graph.facebook.com/v19.0/${fbPageId}?fields=instagram_business_account&access_token=${accessToken}`
    );

    const data = await response.json();
    return data.instagram_business_account ? data.instagram_business_account.id : null;
}

export async function loader({ request }: LoaderFunctionArgs) {
    const { session } = await authenticate.admin(request);
    const { id: sessionId } = session;
    let igRes;
    let firstFacebookPage;
    let instagramPageId;

    try {
        const [sessionData, allFinishedJobs, shopSettings] = await Promise.all([
            scheduledQueueService.getAllScheduledItems(sessionId),
            jobService.getAllfinishedJobs(sessionId),
            shopSettingsService.getShopSettings(sessionId)
        ]);

        const fbAccessToken = shopSettings?.settings?.facebookAccessToken as string;

        if (fbAccessToken) {
            firstFacebookPage = (await getFirstFacebookPage(fbAccessToken)) as string;
            instagramPageId = await getInstagramAccountForPage(firstFacebookPage, fbAccessToken);
        }

        let serializedScheduledItems = sessionData.postScheduleQueue.map((item) => ({
            ...item,
            productId: Number(item.productId)
        }));

        if (fbAccessToken && instagramPageId != undefined) {
            const request: GetPageInfoRequest = new GetPageInfoRequest(
                fbAccessToken,
                instagramPageId,
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

        return createApiResponse(
            false,
            '',
            igRes,
            serializedScheduledItems,
            allFinishedJobs,
            sessionId,
            fbAccessToken
        );
    } catch (error) {
        console.log('Something went wrong on dashboard', error);
        return createApiResponse(true, 'An error Occured:' + error);
    }
}

export const action = async ({ request }: ActionFunctionArgs) => {
    const { sessionToken } = await authenticate.admin(request);
    const { id: sessionId } = (await authenticate.admin(request))?.session;

    const formData = await request.formData();
    const fbAccessToken = formData.get(FormNames.fbAccessToken) as string;
    const fbPageId = formData.get(FormNames.fbPageId) as string;

    console.log('fbAccessToken', fbAccessToken, 'fbPageId', fbPageId, 'sessionToken', sessionToken);

    try {
        await shopSettingsService.upsertFacebookAccessToken(sessionId, fbAccessToken, fbPageId);
    } catch (error) {
        console.log('DAS HAT NICHT FUNKTIONIERT', error);
    }

    return 'successfully updated access Token';
};

function Dashboard() {
    const {
        igRes,
        allScheduledItems,
        allFinishedJobs,
        FB_APP_ID,
        FB_APP_SECRET,
        sessionId,
        fbAccessToken,
        fbPageId
    } = useLoaderData<typeof loader>();

    let allScheduledItemsArr = [{}] as PostScheduleQueue[];
    if (allScheduledItems != undefined) {
        allScheduledItemsArr = JSON.parse(JSON.stringify(allScheduledItems)) as PostScheduleQueue[];
    }

    const isUserFbAccountConnected = fbAccessToken !== '' && fbAccessToken !== null ? true : false;
    const submit = useSubmit();

    const handleLogin = () => {
        handleFBLogin(async (response) => {
            console.log('----- RESPONSE ------', response.authResponse);

            const shortLivedToken = response.authResponse.accessToken;
            const longLivedToken = await exchangeForLongLivedToken(shortLivedToken);

            let firstFacebookPage = (await getFirstFacebookPage(longLivedToken)) as string;

            async function getInstagramAccountForPage(fbPageId: string, accessToken: string) {
                const response = await fetch(
                    `https://graph.facebook.com/v19.0/${fbPageId}?fields=instagram_business_account&access_token=${longLivedToken}`
                );

                const data = await response.json();
                return data.instagram_business_account ? data.instagram_business_account.id : null;
            }

            const fbPageId = await getInstagramAccountForPage(firstFacebookPage, longLivedToken);

            console.log({
                fbAccessTokenInput: longLivedToken,
                sessionIdInput: sessionId,
                fbPageId: fbPageId
            });

            console.log('POST FORM', {
                longLivedToken: longLivedToken,
                sessionId: sessionId,
                fbPageId: fbPageId
            });

            if (longLivedToken && sessionId && fbPageId) {
                const formData = new FormData();
                formData.append('fb_access_token', longLivedToken);
                formData.append('fb_page_id', fbPageId);
                formData.append('sessionId', sessionId);
                submit(formData, { method: 'post' });
            }
        });
    };

    const exchangeForLongLivedToken = async (shortLivedToken: string) => {
        const response = await fetch(
            `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${FB_APP_ID}&client_secret=${FB_APP_SECRET}&fb_exchange_token=${shortLivedToken}`
        );
        const data = await response.json();
        return data.access_token;
    };

    const fetchUserData = () => {
        window.FB.api('/me', { fields: 'name,email' }, function (response: any) {
            // setUserData(response);
        });
    };

    const fetchUserPages = async (accessToken: string) => {
        const response = await fetch(
            `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`
        );
        const data = await response.json();
        return data.data;
    };

    let scheduledPosts = allScheduledItemsArr?.map((scheduledItem: PostScheduleQueue, key) => {
        let scheduledItemPostDetailsJSON: InstagramPostDetails = JSON.parse(
            JSON.stringify(scheduledItem.postDetails)
        );
        let scheduleDate = moment(scheduledItem.dateScheduled).format(
            'dddd, YYYY-MM-DD [at] hh:mma'
        );

        let BadgeMarkup =
            scheduledItem.scheduleStatus === 'draft' ? (
                <Badge progress="incomplete" tone="attention">
                    {scheduledItem.scheduleStatus.toUpperCase()}
                </Badge>
            ) : (
                <Badge progress="partiallyComplete" tone="warning-strong">
                    {scheduledItem.scheduleStatus.toUpperCase()}
                </Badge>
            );

        return {
            id: key.toString(),
            imgUrl: scheduledItemPostDetailsJSON.postImgUrl,
            description: scheduledItemPostDetailsJSON.postDescription,
            scheduleDate: scheduleDate,
            postStatus: BadgeMarkup
        };
    });

    let finishedPosts = allFinishedJobs.map(
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
            let lastFinishedAt = moment(job.lastFinishedAt).format('dddd, YYYY-MM-DD [at] hh:mma');
            return {
                id: job.id,
                imgUrl: job.imgUrl,
                description: job.postDescription as TrustedHTML,
                scheduleDate: lastFinishedAt,
                postStatus: (
                    <Badge progress="complete" tone="success">
                        POSTED
                    </Badge>
                )
            };
        }
    );

    let posts = scheduledPosts.concat(finishedPosts);
    console.log('is Connected?', isUserFbAccountConnected);
    return (
        <Page fullWidth title="Dashboard">
            <BlockStack gap={'400'}>
                <FbAccountConnection
                    isConnected={isUserFbAccountConnected}
                    accName={igRes?.username}
                    handleLogin={handleLogin}
                    connectionDetails={igRes}
                />
                {isUserFbAccountConnected && (
                    <BlockStack gap={'400'}>
                        <Divider />
                        <Text as="h2" variant="headingLg">
                            Your Schedule Queue
                        </Text>
                        <PostTable posts={posts} />
                    </BlockStack>
                )}
            </BlockStack>
        </Page>
    );
}

export default Dashboard;
