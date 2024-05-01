import { useState } from 'react';

import { type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, json, useActionData, useLoaderData } from '@remix-run/react';
import { authenticate } from '~/shopify.server';
import { queries } from '~/utils/queries';
import { Text } from '@shopify/polaris';
import instagramApiService from '~/services/instagramApiService.server';
import { Action, PlaceholderVariable, PostForm, PublishType } from '../global_utils/enum';
import { ProductInfo } from '../global_utils/types';
import PostItem from '../app.schedule/components/PostItem';
import ImagePicker from '~/components/PostRow/ImagePicker';
import DiscountsPicker from '~/components/PostRow/DiscountsPicker';
import TextArea from '~/components/PostRow/TextArea';

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

    console.log('formData', formData.getAll('description'));

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

    const placeholders = [
        {
            customPlaceholderId: 'TEST',
            customPlaceholderContent: '#Moinsen!!asdf',
            settingsId: 'l4-dev-shop.myshopify.com'
        },
        {
            customPlaceholderId: 'TEST_2',
            customPlaceholderContent: 'hi',
            settingsId: 'l4-dev-shop.myshopify.com'
        },
        {
            customPlaceholderId: '{HASHTAG_1}',
            customPlaceholderContent: '#supi',
            settingsId: 'l4-dev-shop.myshopify.com'
        },
        {
            customPlaceholderId: 'TEST_3',
            customPlaceholderContent: '#TESTING motherfucker',
            settingsId: 'l4-dev-shop.myshopify.com'
        },
        {
            customPlaceholderId: 'test',
            customPlaceholderContent: 'testtest',
            settingsId: 'l4-dev-shop.myshopify.com'
        }
    ];

    return (
        <div>
            {productsArray &&
                productsArray.map((e: ProductInfo, key) => {
                    let productId = e.id;
                    let images = e.images?.nodes;
                    let title = e.title;
                    let description = e.description;

                    return (
                        <>
                            <Form method="post">
                                <input type="hidden" name="product_id" value={productId} />

                                <div key={key} id={productId}>
                                    <Text variant="headingLg" as="h3">
                                        {title}
                                    </Text>

                                    <ImagePicker images={images} />
                                    <DiscountsPicker discountsArray={discountsArray} />
                                    <TextArea
                                        description={description}
                                        title={title}
                                        placeholders={placeholders}
                                    />

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
