import { useState } from 'react';

import { type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, json, useActionData, useLoaderData } from '@remix-run/react';
import { authenticate } from '~/shopify.server';
import { queries } from '~/utils/queries';
import { Text } from '@shopify/polaris';
import instagramApiService from '~/services/instagramApiService.server';
import { Action, PlaceholderVariable, PostForm, PublishType } from '../global_utils/enum';
import ImagePicker from '~/components/PostRow/ImagePicker';
import DiscountsPicker from '~/components/PostRow/DiscountsPicker';
import TextArea from '~/components/PostRow/TextArea';
import { IShopifyProduct } from '~/types/types';

export async function loader({ request }: LoaderFunctionArgs) {
    const { admin } = await authenticate.admin(request);

    try {
        const res = await admin.graphql(`${queries.getAllProducts}`);
        const discountRes = await admin.graphql(`${queries.queryAllDiscounts}`);
        let { customPlaceholder } = await prisma.settings.findFirstOrThrow({
            where: { id: 'l4-dev-shop.myshopify.com' },
            include: {
                customPlaceholder: true
            }
        });

        return json({
            allAvailableProducts: await res.json(),
            allAvailableDiscounts: await discountRes.json(),
            customPlaceholder: customPlaceholder
        });
    } catch (error) {
        return {
            allAvailableProducts: null,
            allAvailableDiscounts: null,
            customPlaceholder: null
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
            await instagramApiService.publishMedia(imageUrl, description, productId);
        }

        return { message: 'PUBLISHED SUCCESFULLY !', error: false, productId: productId };
    } catch (error) {
        return { message: `${error}`, error: true, productId: productId };
    }
};

export default function PublishMedia() {
    const actionData = useActionData<typeof action>();
    const { allAvailableProducts, allAvailableDiscounts, customPlaceholder } =
        useLoaderData<typeof loader>();
    const productsArray = [...allAvailableProducts?.data?.products?.nodes];
    const discountsArray = [...allAvailableDiscounts?.data?.codeDiscountNodes?.nodes];

    return (
        <div>
            {productsArray &&
                productsArray.map((product: IShopifyProduct, key) => {
                    let productId = product.id;
                    let images = product.images?.nodes;
                    let title = product.title;
                    let description = product.description;

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
                                    <TextArea placeholders={customPlaceholder} product={product} />

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
