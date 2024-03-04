import { ActionFunctionArgs } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { LoaderFunctionArgs } from '@remix-run/server-runtime';
import moment from 'moment';
import React, { useState } from 'react';
import { authenticate } from '~/shopify.server';
import { queries } from '~/utils/queries';

export async function loader({ request }: LoaderFunctionArgs) {
    const { admin } = await authenticate.admin(request);
    const res = await admin.graphql(`${queries.queryAllProducts}`);
    return res.json();
}

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    console.log('formData', formData);

    return null;
};

export default function Campaign() {
    // const minDate = new Date().toISOString().split('T')[0];
    const minDate = moment().format('YYYY-MM-DD');
    const maxDate = moment().add(3, 'months').format('YYYY-MM-DD');

    const [selectedDate, setselectedDate] = useState(minDate);

    const loaderData = useLoaderData<typeof loader>();
    const productsArray = [...loaderData.data.products.nodes];

    const handleDateSelect = (e: any) => {
        console.log('e.target.value', e.target.value);
        setselectedDate(e.target.value);
    };

    console.log('selectedDate', selectedDate);

    return (
        <Form method="post">
            Campaigns!
            {productsArray.map((e, key) => {
                return (
                    <div key={key}>
                        <input
                            type="radio"
                            id={e.id}
                            name="featuredImageUrl"
                            value={e.featuredImage.url}
                            //   onChange={handleChange}
                        />
                        <img alt="img" width={'150px'} src={e.featuredImage.url} />
                        <label htmlFor="featuredImageUrl">{e.title}</label>
                        <div style={{ width: '30rem', background: '#ccc' }}>{e.description}</div>
                        <input
                            type="date"
                            id="post-date"
                            name="post-date"
                            value={selectedDate}
                            min={minDate}
                            max={maxDate}
                            onChange={handleDateSelect}
                        />
                        <input type="time" id="post-time" name="post-time" />
                    </div>
                );
            })}
            <button type="submit">Schedule Post</button>
        </Form>
    );
}
