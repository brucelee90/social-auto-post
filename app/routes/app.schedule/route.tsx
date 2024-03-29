import { ActionFunctionArgs } from '@remix-run/node';
import { json, useActionData, useLoaderData } from '@remix-run/react';
import { LoaderFunctionArgs } from '@remix-run/server-runtime';
import { Text } from '@shopify/polaris';
import moment from 'moment';
import { TSMap } from 'typescript-map';
import postScheduleQueueService from '~/services/postScheduleQueueService.server';
import { authenticate } from '~/shopify.server';
import { queries } from '~/utils/queries';
import { scheduleUtils } from './scheduleUtils';
import PostItem from './components/PostItem';
import { JobAction } from '../global_utils/types';

export async function loader({ request }: LoaderFunctionArgs) {
    const { admin } = await authenticate.admin(request);
    const res = await admin.graphql(`${queries.queryAllProducts}`);

    // Bigint is not serializable that's why we have to create a Map
    let allScheduledItems = new TSMap();
    (await postScheduleQueueService.getAllScheduledItems()).map((e) => {
        allScheduledItems.set(e.productId, e.dateScheduled);
    });

    return json({
        allAvailableProducts: await res.json(),
        allScheduledItems: allScheduledItems.toJSON()
    });
}

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const productId = formData.get('product_id') as string;
    const scheduledDate = formData.get('scheduled_date');
    const scheduledTime = formData.get('scheduled_time');
    const postDescription = formData.get('post_description') as string;
    const postImageUrl = formData.get('post_image_url') as string;
    const cancelJob = formData.get(JobAction.cancel) as string;
    const scheduleJob = formData.get(JobAction.schedule) as string;
    const scheduledPostDateTime = moment(
        `${scheduledDate} ${scheduledTime}`,
        'YYYY-MM-DD HH:mm'
    ).toISOString();

    try {
        if (scheduleJob) {
            return scheduleUtils.scheduleJobFunc(
                productId,
                scheduledPostDateTime,
                postImageUrl,
                postDescription
            );
        } else if (cancelJob) {
            return scheduleUtils.cancelJobFunc(productId);
        }
    } catch (error) {
        return scheduleUtils.errorMessage(productId);
    }
};

export default function Schedule() {
    const { allAvailableProducts, allScheduledItems } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();

    try {
        const allScheduledItemsMap = new TSMap().fromJSON(allScheduledItems);
        const productsArray = [...allAvailableProducts?.data?.products?.nodes];
        const isScheduleSuccessfull = !actionData?.error as boolean;
        const actionMessage = actionData?.message as string;
        const actionProductId = actionData?.productId as string;
        const action = actionData?.action as string;

        return (
            <div>
                <Text variant="heading2xl" as="h3">
                    Schedule
                </Text>

                <PostItem
                    actionProductId={actionProductId}
                    actionMessage={actionMessage}
                    isScheduleSuccessfull={isScheduleSuccessfull}
                    action={action}
                    productsArray={productsArray}
                    allScheduledItemsMap={allScheduledItemsMap}
                />
            </div>
        );
    } catch (error) {
        return <div>There are no items to be scheduled </div>;
    }
}
