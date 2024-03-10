import { ActionFunctionArgs } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { LoaderFunctionArgs } from '@remix-run/server-runtime';
import { Text } from '@shopify/polaris';
import moment from 'moment';
import { useState } from 'react';
import DatePicker from '~/components/mediaqueue/DatePicker';
import messageBrokerService from '~/services/messagingBrokerService.server';
import postScheduleQueueService from '~/services/postScheduleQueueService.server';
import { authenticate } from '~/shopify.server';
import { queries } from '~/utils/queries';

export async function loader({ request }: LoaderFunctionArgs) {
    const { admin } = await authenticate.admin(request);
    const res = await admin.graphql(`${queries.queryAllProducts}`);
    return res.json();
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
        messageBrokerService.addItemToQueue(
            `{"action": "schedule", "productId": "${productId}", "scheduledTime": "${scheduledTime}"}`
        );

        postScheduleQueueService.addToPostScheduleQueue(
            parseInt(productId),
            scheduledPostDateTime,
            postImageUrl,
            postDescription
        );

        console.log('post Product', productId, 'on', scheduledPostDateTime);

        return {
            error: false,
            message: `Product set to be scheduled on ${scheduledDate} at ${scheduledTime}`,
            action: 'schedule',
            productId: productId
        };
    };

    const cancelJobFunc = (productId: string) => {
        messageBrokerService.addItemToQueue(
            `{"action": "cancel", "productId": "${productId}", "scheduledTime": ""}`
        );
        try {
            postScheduleQueueService.removeScheduledItemFromQueue(parseInt(productId));
        } catch (error) {
            console.log(
                `${productId} could not be deleted from post ScheduleService. The current queue contains ${postScheduleQueueService.getScheduledItemsByDate(new Date())}`
            );
        }

        console.log('Cancel Product', productId, 'on', scheduledPostDateTime);

        return {
            error: false,
            message: `Scheduled product was successfully cancelled ${scheduledDate}`,
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
            productId: productId
        };
    }
};

export default function Schedule() {
    const loaderData = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const productsArray = [...loaderData.data.products.nodes];

    const isScheduleSuccessfull = !actionData?.error;
    const actionMessage = actionData?.message;
    const actionProductId = actionData?.productId;

    return (
        <div>
            <Text variant="heading2xl" as="h3">
                Schedule
            </Text>
            {productsArray.map((e, key) => {
                let productId = e.id.split('/');
                productId = productId[productId.length - 1];
                let imageUrl = e.featuredImage?.url;

                let isEligibleForScheduling = false;
                if (productId !== undefined && imageUrl !== undefined) {
                    isEligibleForScheduling = true;
                }

                return (
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
                                />
                            ) : (
                                <div>
                                    Please make sure that you have set an image and a description
                                    for this product
                                </div>
                            )}

                            <hr />
                        </div>
                    </Form>
                );
            })}
        </div>
    );
}

interface Props {
    actionProductId: string | undefined;
    productId: string;
    actionMessage: string | undefined;
    isScheduleSuccessfull: boolean;
}

export function PostBtn(props: Props) {
    const { actionProductId, productId, actionMessage, isScheduleSuccessfull } = props;
    const isScheduled = actionMessage?.includes('schedule');

    return (
        <div>
            <div>{actionMessage}</div>
            {actionProductId === productId && isScheduled === true ? (
                <div>
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
