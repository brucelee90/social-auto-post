import { ActionFunctionArgs } from '@remix-run/node';
import { json, useActionData, useLoaderData } from '@remix-run/react';
import { LoaderFunctionArgs } from '@remix-run/server-runtime';
import { Text } from '@shopify/polaris';
import moment from 'moment';
import { TSMap } from 'typescript-map';
import postScheduleQueueService from '~/jobs/schedulequeue.service.server';
import { authenticate } from '~/shopify.server';
import { queries } from '~/utils/queries';
import { scheduleUtils } from './scheduleUtils';
import PostItem from './components/PostItem';
import { JobAction, PlaceholderVariable, PostForm } from '../global_utils/enum';
import { getSettings } from '~/services/SettingsService.server';
import { getDefaultCaptionContent } from '../app.settings/components/DefaultCaptionForm';
import { useState } from 'react';

export async function loader({ request }: LoaderFunctionArgs) {
    const { admin, session } = await authenticate.admin(request);
    const { shop } = session;

    const [res, discountRes, shopSettings, allCollections] = await Promise.all([
        admin.graphql(`${queries.getAllProducts}`).then((res) => res.json()),
        admin.graphql(`${queries.queryAllDiscounts}`).then((res) => res.json()),
        getSettings(shop),
        admin.graphql(`${queries.getAllCollections}`).then((res) => res.json())
    ]);

    // Bigint is not serializable that's why we have to create a Map
    let allScheduledItems = new TSMap();
    let allScheduledItemsDescription = new TSMap();
    (await postScheduleQueueService.getAllScheduledItems()).map((e) => {
        allScheduledItems.set(e.productId, e.dateScheduled);
        allScheduledItemsDescription.set(e.productId, e.postDescription);
    });

    return json({
        allAvailableProducts: res,
        allScheduledItems: allScheduledItems.toJSON(),
        allScheduledItemsDescription: allScheduledItemsDescription.toJSON(),
        allAvailableDiscounts: discountRes,
        customPlaceholder: shopSettings?.customPlaceholder,
        defaultCaption: shopSettings?.defaultCaption,
        allCollections: allCollections
    });
}

export const action = async ({ request }: ActionFunctionArgs) => {
    const { shop } = (await authenticate.admin(request))?.session;

    const formData = await request.formData();
    const productId = formData.get('product_id') as string;
    const scheduledDate = formData.get('scheduled_date');
    const scheduledTime = formData.get('scheduled_time');
    let postDescription = formData.get(PostForm.description) as string;
    const postImageUrl = formData.getAll(PostForm.imgUrl) as string[];
    const cancelJob = formData.get(JobAction.cancel) as string;
    const scheduleJob = formData.get(JobAction.schedule) as string;
    const codeDiscount = formData.get(PostForm.codeDiscount) as string;

    const scheduledPostDateTime = moment(
        `${scheduledDate} ${scheduledTime}`,
        'YYYY-MM-DD HH:mm'
    ).toISOString();

    postDescription = postDescription?.replace(PlaceholderVariable.codeDiscount, codeDiscount);

    try {
        if (scheduleJob) {
            return scheduleUtils.scheduleJobFunc(
                productId,
                scheduledPostDateTime,
                postImageUrl,
                postDescription,
                shop
            );
        } else if (cancelJob) {
            return scheduleUtils.cancelJobFunc(productId);
        }
    } catch (error) {
        return scheduleUtils.errorMessage(productId);
    }
};

export default function Schedule() {
    const {
        allAvailableProducts,
        allScheduledItems,
        allAvailableDiscounts,
        allScheduledItemsDescription,
        customPlaceholder,
        defaultCaption,
        allCollections
    } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();

    try {
        const allScheduledItemsMap = new TSMap().fromJSON(allScheduledItems);
        const allScheduledItemsDescriptionMap = new TSMap().fromJSON(allScheduledItemsDescription);
        const productsArray = [...allAvailableProducts?.data?.products?.nodes];
        const isScheduleSuccessfull = !actionData?.error as boolean;
        const actionMessage = actionData?.message as string;
        const actionProductId = actionData?.productId as string;
        const action = actionData?.action as string;
        const discountsArray = [...allAvailableDiscounts?.data?.codeDiscountNodes?.nodes];
        const defaultCaptionContent = getDefaultCaptionContent(defaultCaption);
        const collections = [...allCollections?.data?.collections?.nodes];

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
                    allScheduledItemsDescriptionMap={allScheduledItemsDescriptionMap}
                    discountsArray={discountsArray}
                    placeholders={customPlaceholder}
                    defaultCaption={defaultCaptionContent}
                    collections={collections}
                />
            </div>
        );
    } catch (error) {
        return <div>There are no items to be scheduled </div>;
    }
}
