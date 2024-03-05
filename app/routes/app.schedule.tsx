import { ActionFunctionArgs } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { LoaderFunctionArgs } from '@remix-run/server-runtime';
import moment from 'moment';
import React, { useState } from 'react';
import DatePicker from '~/components/mediaqueue/DatePicker';
import { addToPostScheduleQueue } from '~/controllers/post_schedule.server';
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

    var scheduledPostDateTime = moment(
        scheduledDate + ' ' + scheduledTime,
        'YYYY-MM-DD HH:mm'
    ).toISOString();

    console.log('post Product', productId, 'on', scheduledPostDateTime);

    addToPostScheduleQueue(parseInt(productId), scheduledPostDateTime);

    return null;
};

export default function Schedule() {
    // const minDate = new Date().toISOString().split('T')[0];

    const loaderData = useLoaderData<typeof loader>();
    const productsArray = [...loaderData.data.products.nodes];

    return (
        <div>
            Campaigns!
            {productsArray.map((e, key) => {
                let productId = e.id.split('/');
                productId = productId[productId.length - 1];
                let imgSrcUrl = e.featuredImage.url;

                return (
                    <Form method="post" key={key}>
                        <div>
                            <input type="hidden" name="product_id" value={productId} />
                            {/* <input type='hidden' name="img_url" value={imgSrcUrl} /> */}
                            <img alt="img" width={'150px'} src={e.featuredImage.url} />
                            <label htmlFor="featuredImageUrl">{e.title}</label>
                            <div style={{ width: '30rem', background: '#ccc' }}>
                                {e.description}
                            </div>
                            <DatePicker name={`scheduled_date`} />
                            <input type="time" id="scheduled_time" name={`scheduled_time`} />
                        </div>
                        <button type="submit">Schedule Post</button>
                    </Form>
                );
            })}
        </div>
    );
}
