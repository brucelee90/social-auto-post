import { ActionFunctionArgs } from '@remix-run/node';
import { Form, json, useActionData, useLoaderData } from '@remix-run/react';
import { LoaderFunctionArgs } from '@remix-run/server-runtime';
import { Text } from '@shopify/polaris';
import moment from 'moment';
import { useState } from 'react';
import { TSMap } from 'typescript-map';
import DatePicker from '~/components/mediaqueue/DatePicker';
import messageBrokerService from '~/services/messagingBrokerService.server';
import postScheduleQueueService from '~/services/postScheduleQueueService.server';
import { authenticate } from '~/shopify.server';
import { queries } from '~/utils/queries';

// Refactor: create seperate route directory and put components, loaders and actions in seperate files
export async function loader({ request }: LoaderFunctionArgs) {
    const { admin } = await authenticate.admin(request);
    const res = await admin.graphql(`${queries.queryAllProducts}`);

    // Bigint is not serializable that's why
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
    const cancelJob = formData.get('cancel_job') as string;
    const scheduleJob = formData.get('schedule_job') as string;

    const scheduleJobFunc = (
        productId: string,
        scheduledPostDateTime: string,
        postImageUrl: string,
        postDescription: string
    ) => {
        // REFACTOR THIS TO BETTER MAKE SURE THAT JSON ALWAYS HAS SAME STRUCTURE
        messageBrokerService.addItemToQueue(
            `{"action": "schedule", "productId": "${productId}", "scheduledTime": "${scheduledTime}"}`
        );

        postScheduleQueueService.addToPostScheduleQueue(
            productId,
            scheduledPostDateTime,
            postImageUrl,
            postDescription
        );

        console.log('post Product', productId, 'on', scheduledPostDateTime);

        return {
            error: false,
            message: `Set to be scheduled on ${moment(scheduledPostDateTime).format('YYYY MM DD')} at ${moment(scheduledPostDateTime).format('hh:mm')}`,
            action: 'schedule',
            productId: productId
        };
    };

    const cancelJobFunc = (productId: string) => {
        // REFACTOR THIS TO BETTER MAKE SURE THAT JSON ALWAYS HAS SAME STRUCTURE
        messageBrokerService.addItemToQueue(
            `{"action": "cancel", "productId": "${productId}", "scheduledTime": ""}`
        );
        try {
            postScheduleQueueService.removeScheduledItemFromQueue(productId);
        } catch (error) {
            console.log(
                `${productId} could not be deleted from post ScheduleService. The current queue contains ${postScheduleQueueService.getScheduledItemsByDate(new Date())}`
            );
        }

        return {
            error: false,
            message: `Scheduled product was cancelled successfully`,
            action: 'cancel',
            productId: productId
        };
    };

    let scheduledPostDateTime = moment(
        scheduledDate + ' ' + scheduledTime,
        'YYYY-MM-DD HH:mm'
    ).toISOString();

    try {
        if (scheduleJob) {
            return scheduleJobFunc(productId, scheduledPostDateTime, postImageUrl, postDescription);
        } else if (cancelJob) {
            return cancelJobFunc(productId);
        }
    } catch (error) {
        return {
            error: true,
            message: 'Product Could not be posted, please',
            productId: productId,
            action: 'error'
        };
    }
};

export default function Schedule() {
    // const loaderData = useLoaderData<typeof loader>();
    const { allAvailableProducts, allScheduledItems } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const allScheduledItemsMap = new TSMap().fromJSON(allScheduledItems);

    try {
        let productsArray = [...allAvailableProducts?.data?.products?.nodes];

        const isScheduleSuccessfull = !actionData?.error as boolean;
        const actionMessage = actionData?.message as string;
        const actionProductId = actionData?.productId as string;
        const action = actionData?.action as string;

        let isProductsArrayAvailable = productsArray?.length > 0;

        return (
            <div>
                <Text variant="heading2xl" as="h3">
                    Schedule
                </Text>

                {productsArray.map((e, key) => {
                    let productIdArr = e.id.split('/');
                    let productId = productIdArr[productIdArr.length - 1];
                    let imageUrl = e.featuredImage?.url;
                    let scheduledDate = allScheduledItemsMap.get(`${productId}`) as string;

                    let isEligibleForScheduling = false;
                    if (productId !== undefined && imageUrl !== undefined) {
                        isEligibleForScheduling = true;
                    }

                    return (
                        <div key={key}>
                            <Form method="post">
                                <div>
                                    <input type="hidden" name="product_id" value={productId} />
                                    <input type="hidden" name="post_image_url" value={imageUrl} />
                                    <div>
                                        <Text variant="headingXl" as="h4">
                                            {e.title}
                                        </Text>
                                        <img alt="img" width={'150px'} src={imageUrl} />
                                    </div>
                                    <div>
                                        <textarea
                                            style={{ width: '30rem', background: '#ccc' }}
                                            name="post_description"
                                            rows={10}
                                            defaultValue={e.description}
                                        />
                                    </div>
                                    {isEligibleForScheduling ? (
                                        <PostBtn
                                            actionProductId={actionProductId}
                                            productId={productId}
                                            actionMessage={actionMessage}
                                            isScheduleSuccessfull={isScheduleSuccessfull}
                                            scheduledDate={scheduledDate}
                                            action={action}
                                        />
                                    ) : (
                                        <div>
                                            Please make sure that you have set an image and a
                                            description for this product
                                        </div>
                                    )}

                                    <hr />
                                </div>
                            </Form>
                        </div>
                    );
                })}
            </div>
        );
    } catch (error) {
        return <div>There are no items to be scheduled </div>;
    }
}

interface Props {
    actionProductId: string | undefined;
    productId: string;
    actionMessage: string | undefined;
    isScheduleSuccessfull: boolean;
    scheduledDate: string;
    action: string;
}

export function PostBtn(props: Props) {
    const {
        actionProductId,
        productId,
        actionMessage,
        isScheduleSuccessfull,
        scheduledDate,
        action
    } = props;

    const [scheduledDateStr, setScheduledDate] = useState(scheduledDate);

    // Refactor: shouldn
    let isScheduled = actionMessage?.includes('schedule');
    let isCurrentProductEdited = actionProductId === productId;
    let hasScheduledDate = scheduledDateStr !== undefined;

    let showCancelButton = (isScheduled && isCurrentProductEdited) || hasScheduledDate;

    // A cancellation will override everything
    let isCancelled = action === 'cancel';
    if (isCurrentProductEdited && isCancelled) {
        showCancelButton = false;
    }

    console.log('isCancelled', isCancelled);

    let notification = actionMessage;

    if (scheduledDate) {
        notification = `Set to be scheduled on ${moment(scheduledDate).format('YYYY MM DD')} at ${moment(scheduledDate).format('hh:mm')}`;
    }

    return (
        <div>
            {showCancelButton ? (
                <div>
                    <div>{notification}</div>
                    {/* Refactor: Button sollte eigene komponente haben und nur parameter entgegennehmen */}
                    {isScheduleSuccessfull ? (
                        <button type="submit" name="cancel_job" value="cancel_job">
                            Cancel and Reschedule Post
                        </button>
                    ) : (
                        <button type="submit" name="schedule_job">
                            Retry Schedule
                        </button>
                    )}
                </div>
            ) : (
                <div>
                    <div>
                        <DatePicker name={`scheduled_date`} />
                        <input type="time" id="scheduled_time" name={`scheduled_time`} />
                    </div>
                    <button type="submit" name="schedule_job" value="schedule_job">
                        Schedule Post
                    </button>
                </div>
            )}
        </div>
    );
}
