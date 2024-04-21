import { useState } from 'react';

import { type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, json, useActionData, useLoaderData } from '@remix-run/react';
import { authenticate } from '~/shopify.server';
import { queries } from '~/utils/queries';
import { Text } from '@shopify/polaris';
import instagramApiService from '~/services/instagramApiService.server';
import { Action, PlaceholderVariable, PostForm, PublishType } from '../global_utils/enum';
import { ProductInfo } from '../global_utils/types';

export async function loader({ request }: LoaderFunctionArgs) {
    const { admin } = await authenticate.admin(request);

    try {
        const res = await admin.graphql(`${queries.queryAllProducts}`);
        const discountRes = await admin.graphql(`${queries.queryAllDiscounts}`);
        return json({
            allAvailableProducts: await res.json(),
            allAvailableDiscounts: await discountRes.json()
        });
    } catch (error) {
        return {
            allAvailableProducts: null,
            allAvailableDiscounts: null
        };
    }
}

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const imageUrl = formData.getAll(PostForm.imgUrl) as string[];
    const postDescription = formData.get(PostForm.description) as string;
    const productId = formData.get('product_id') as string;
    const publishAction = formData.getAll(Action.post) as string[];
    const codeDiscount = formData.get(PostForm.codeDiscount) as string;

    let description = postDescription.replace(PlaceholderVariable.codeDiscount, codeDiscount);

    try {
        if (publishAction.includes(PublishType.publishStory)) {
            await instagramApiService.publishStoryMedia(imageUrl[0]);
        } else if (publishAction.includes(PublishType.publishMedia)) {
            await instagramApiService.publishMedia(imageUrl, description);
        }

        return { message: 'PUBLISHED SUCCESFULLY !', error: false, productId: productId };
    } catch (error) {
        return { message: `${error}`, error: true, productId: productId };
    }
};

export default function PublishMedia() {
    const actionData = useActionData<typeof action>();
    const { allAvailableProducts, allAvailableDiscounts } = useLoaderData<typeof loader>();
    const productsArray = [...allAvailableProducts?.data?.products?.nodes];
    const discountsArray = [...allAvailableDiscounts?.data?.codeDiscountNodes?.nodes];

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
                                    <ul>
                                        <fieldset style={{ display: 'flex' }}>
                                            {images.map((e, key) => {
                                                return (
                                                    <li key={key}>
                                                        <input
                                                            type="checkbox"
                                                            id={PostForm.imgUrl}
                                                            name={PostForm.imgUrl}
                                                            value={e.url}
                                                        />
                                                        <img src={e.url} height={150} />
                                                    </li>
                                                );
                                            })}
                                        </fieldset>
                                    </ul>

                                    <div>Discounts:</div>
                                    <ul>
                                        {discountsArray.map((e, key) => {
                                            return (
                                                <li key={key}>
                                                    <input
                                                        type="radio"
                                                        id={`code-discount-${e.codeDiscount.title}`}
                                                        name="code_discount"
                                                        value={e.codeDiscount.title}
                                                    />
                                                    <label
                                                        htmlFor={`code-discount-${e.codeDiscount.title}`}
                                                    >
                                                        {e.codeDiscount.title}
                                                    </label>
                                                </li>
                                            );
                                        })}
                                    </ul>

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
                                                <button
                                                    type="submit"
                                                    name={Action.post}
                                                    value={PublishType.publishMedia}
                                                >
                                                    PUBLISH MEDIA
                                                </button>
                                                <button
                                                    type="submit"
                                                    name={Action.post}
                                                    value={PublishType.publishStory}
                                                >
                                                    PUBLISH STORY
                                                </button>
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
