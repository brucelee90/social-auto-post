import { ActionFunctionArgs } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { LoaderFunctionArgs } from '@remix-run/server-runtime';
import { Text } from '@shopify/polaris';
import moment from 'moment';
import React, { useState } from 'react';
import DatePicker from '~/components/mediaqueue/DatePicker';
import { addToPostScheduleQueue } from '~/controllers/post_schedule.server';
import { messagingBroker } from '~/modules/messagingBroker.server';
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

    var scheduledPostDateTime = moment(
        scheduledDate + ' ' + scheduledTime,
        'YYYY-MM-DD HH:mm'
    ).toISOString();

    try {
        messagingBroker.addItemToRabbitMQPostQueue(
            `schedule ${productId} for ${scheduledPostDateTime}`
        );
        addToPostScheduleQueue(
            parseInt(productId),
            scheduledPostDateTime,
            postImageUrl,
            postDescription
        );
        console.log('post Product', productId, 'on', scheduledPostDateTime);
        return {
            error: false,
            message: `Product set to be scheduled on ${scheduledDate} at ${scheduledTime}`,
            productId: productId
        };
    } catch (error) {
        return {
            error: true,
            message: 'Product Could not be posted, please',
            productId: productId
        };
    }
};

export default function Schedule() {
    // const minDate = new Date().toISOString().split('T')[0];

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
                let postImageUrl = e.featuredImage.url;

                return (
                    <Form method="post">
                        <div>
                            <input type="hidden" name="product_id" value={productId} />
                            <input type="hidden" name="post_image_url" value={postImageUrl} />
                            <div>
                                <Text variant="headingXl" as="h4">
                                    {e.title}
                                </Text>
                                <img alt="img" width={'150px'} src={e.featuredImage.url} />
                            </div>
                            <div>
                                <textarea
                                    style={{ width: '30rem', background: '#ccc' }}
                                    name="post_description"
                                    rows={10}
                                    defaultValue={e.description}
                                />
                            </div>

                            {actionProductId === productId ? (
                                <div>
                                    <div>{actionMessage}</div>
                                    {isScheduleSuccessfull ? (
                                        <button type="submit" name="reschedule">
                                            Cancel and Reschedule Post
                                        </button>
                                    ) : (
                                        <button type="submit" name="reschedule">
                                            Retry Schedule
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <div>
                                        <DatePicker name={`scheduled_date`} />
                                        <input
                                            type="time"
                                            id="scheduled_time"
                                            name={`scheduled_time`}
                                        />
                                    </div>
                                    <button type="submit" name="schedule">
                                        Schedule Post
                                    </button>
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
