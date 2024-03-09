import { useState } from 'react';

import { type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { authenticate } from '~/shopify.server';
import instagramApiService from '~/services/instagramApiService.server';
import { queries } from '~/utils/queries';
import { Text } from '@shopify/polaris';

export async function loader({ request }: LoaderFunctionArgs) {
    const { admin } = await authenticate.admin(request);

    try {
        const res = await admin.graphql(`${queries.queryAllProducts}`);
        return res.json();
    } catch (error) {
        return { data: null };
    }
}

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const imageUrl = formData.get('img_url') as string;
    const postDescription = formData.get('post_description') as string;

    console.log('formData', formData);

    try {
        await instagramApiService.publishMedia(imageUrl, postDescription);
        return { message: 'PUBLISHED SUCCESFULLY !', error: false };
    } catch (error) {
        return { message: `${error}`, error: true };
    }
};

export default function PublishMedia() {
    const actionData = useActionData<typeof action>();
    const loaderData = useLoaderData<typeof loader>();
    const productsArray = [...loaderData?.data?.products.nodes];

    return (
        <div>
            {productsArray &&
                productsArray.map((e: any, key) => {
                    let productId = e.id;
                    let imageUrl = e.featuredImage?.url;
                    let title = e.title;
                    let description = e.description;

                    return (
                        <>
                            <Form method="post">
                                <div key={key} id={productId}>
                                    <Text variant="headingLg" as="h3">
                                        {title}
                                    </Text>
                                    <input type="hidden" name="img_url" value={imageUrl} />
                                    <img alt="img" width={'150px'} src={imageUrl} />

                                    <div>
                                        <textarea
                                            rows={5}
                                            name="post_description"
                                            defaultValue={description}
                                            cols={50}
                                        />
                                    </div>

                                    <div>
                                        {imageUrl ? (
                                            <div>
                                                <button type="submit">PUBLISH MEDIA</button>
                                                {actionData && <div>{actionData.message}</div>}
                                            </div>
                                        ) : (
                                            <div>
                                                This product can not be posted. Please make sure
                                                your product has an image
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Form>
                            <hr />
                        </>
                    );
                })}
        </div>
    );
}
