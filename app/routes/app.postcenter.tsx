import { useState } from 'react';

import { type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { authenticate } from '~/shopify.server';
import { queries } from '~/utils/queries';
import { Text } from '@shopify/polaris';
import { ProductInfo } from './global_utils/types';
import { PostForm } from './global_utils/enum';
import instagramApiService from '~/services/instagramApiService.server';
import { PostBtn } from './app.schedule/components/PostBtn';

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
    const imageUrl = formData.getAll(PostForm.imgUrl) as string[];
    const postDescription = formData.get(PostForm.description) as string;
    const productId = formData.get('product_id') as string;

    try {
        if (imageUrl.length === 1) {
            await instagramApiService.publishMedia(imageUrl[0], postDescription);
        } else {
            await instagramApiService.publishCarousel(imageUrl, postDescription);
        }

        return { message: 'PUBLISHED SUCCESFULLY !', error: false, productId: productId };
    } catch (error) {
        return { message: `${error}`, error: true, productId: productId };
    }
};

export default function PublishMedia() {
    const actionData = useActionData<typeof action>();
    const loaderData = useLoaderData<typeof loader>();
    const productsArray = [...loaderData?.data?.products.nodes];

    console.log('actionData', actionData);

    return (
        <div>
            {productsArray &&
                productsArray.map((e: ProductInfo, key) => {
                    let productId = e.id;
                    let imageUrl = e.featuredImage?.url;
                    let images = e.images?.nodes;
                    let title = e.title;
                    let description = e.description;

                    return (
                        <>
                            <Form method="post">
                                <div key={key} id={productId}>
                                    <input type="hidden" name="product_id" value={productId} />
                                    <Text variant="headingLg" as="h3">
                                        {title}
                                    </Text>
                                    {images.map((e, key) => {
                                        return (
                                            <div key={key}>
                                                <input
                                                    name={PostForm.imgUrl}
                                                    value={e.url}
                                                    type="hidden"
                                                />
                                                <img src={e.url} height={150} />
                                            </div>
                                        );
                                    })}

                                    <div>
                                        <textarea
                                            rows={5}
                                            name={PostForm.description}
                                            defaultValue={description}
                                            cols={50}
                                        />
                                    </div>

                                    <div>
                                        {images ? (
                                            <div>
                                                <button type="submit">PUBLISH MEDIA</button>
                                                {actionData?.productId === productId && (
                                                    <div>{actionData.message}</div>
                                                )}
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
