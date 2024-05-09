import { ActionFunctionArgs } from '@remix-run/node';
import { json, useActionData, useFetcher, useLoaderData } from '@remix-run/react';
import { LoaderFunctionArgs } from '@remix-run/server-runtime';
import { Text } from '@shopify/polaris';
import moment from 'moment';
import { TSMap } from 'typescript-map';
import postScheduleQueueService from '~/jobs/schedulequeue.service.server';
import { authenticate } from '~/shopify.server';
import { queries } from '~/utils/queries';
import { scheduleUtils } from './scheduleUtils';
import { JobAction, PlaceholderVariable, PostForm } from '../global_utils/enum';
import { shopSettingsService } from '~/services/SettingsService.server';
import { getDefaultCaptionContent } from '../app.settings/components/DefaultCaptionForm';
import { useState } from 'react';
import { PostBtn } from './components/PostBtn';

import ImagePicker from '~/routes/ui.components/PostRow/ImagePicker';
import TextArea from '~/routes/ui.components/PostRow/TextArea';
import DiscountsPicker from '~/routes/ui.components/PostRow/DiscountsPicker';
import { ICollection, IShopifyProduct } from '~/types/types';

export interface IApiResponse {
    action: string;
    error: boolean;
    message: string;
    productId: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
    const { admin, session } = await authenticate.admin(request);
    const { id: sessionId } = session;

    const [res, discountRes, shopSettings, allCollections] = await Promise.all([
        admin.graphql(`${queries.getAllProducts}`).then((res) => res.json()),
        admin.graphql(`${queries.queryAllDiscounts}`).then((res) => res.json()),
        shopSettingsService.getShopSettings(sessionId),
        admin.graphql(`${queries.getAllCollections}`).then((res) => res.json())
    ]);

    // Bigint is not serializable that's why we have to create a Map
    let allScheduledItems = new TSMap();
    let allScheduledItemsDescription = new TSMap();
    (await postScheduleQueueService.getAllScheduledItems()).map((e) => {
        allScheduledItems.set(e.productId, e.dateScheduled);
        allScheduledItemsDescription.set(e.productId, e.postDescription);
    });

    return json({
        allAvailableProducts: res,
        allScheduledItems: allScheduledItems.toJSON(),
        allScheduledItemsDescription: allScheduledItemsDescription.toJSON(),
        allAvailableDiscounts: discountRes,
        customPlaceholder: shopSettings?.settings?.customPlaceholder,
        defaultCaption: shopSettings?.settings?.defaultCaption,
        allCollections: allCollections
    });
}

export const action = async ({ request }: ActionFunctionArgs) => {
    const { id: sessionId } = (await authenticate.admin(request))?.session;

    const formData = await request.formData();
    const productId = formData.get('product_id') as string;
    const scheduledDate = formData.get('scheduled_date');
    const scheduledTime = formData.get('scheduled_time');
    let postDescription = formData.get(PostForm.description) as string;
    const postImageUrl = formData.getAll(PostForm.imgUrl) as string[];
    const cancelJob = formData.get(JobAction.cancel) as string;
    const scheduleJob = formData.get(JobAction.schedule) as string;
    const codeDiscount = formData.get(PostForm.codeDiscount) as string;

    const scheduledPostDateTime = moment(
        `${scheduledDate} ${scheduledTime}`,
        'YYYY-MM-DD HH:mm'
    ).toISOString();

    postDescription = postDescription?.replace(PlaceholderVariable.codeDiscount, codeDiscount);

    try {
        if (postImageUrl.length === 0) {
            throw new Error();
        } else if (scheduleJob) {
            return scheduleUtils.scheduleJobFunc(
                productId,
                scheduledPostDateTime,
                postImageUrl,
                postDescription,
                sessionId,
                'Schedule'
            );
        } else if (cancelJob) {
            return scheduleUtils.cancelJobFunc(productId);
        }
    } catch (error) {
        return scheduleUtils.errorMessage(productId);
    }
};

interface Props {
    actionProductId: string;
    actionMessage: string;
    isScheduleSuccessfull: boolean;
    action: string;
    productsArray: any[];
    allScheduledItemsMap: TSMap<unknown, unknown>;
    allScheduledItemsDescriptionMap: TSMap<unknown, unknown>;
    discountsArray: { codeDiscount: { title: string } }[];
    placeholders:
        | { customPlaceholderName: string; customPlaceholderContent: string; settingsId: string }[]
        | null
        | undefined;
    defaultCaption: string | undefined;
    collections: ICollection[];
}

export default function Schedule() {
    const {
        allAvailableProducts,
        allScheduledItems,
        allAvailableDiscounts,
        allScheduledItemsDescription,
        customPlaceholder,
        defaultCaption,
        allCollections
    } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();

    try {
        const [collectionFilter, setCollectionFilter] = useState('');
        const [searchString, setSearchString] = useState('');

        const allScheduledItemsMap = new TSMap().fromJSON(allScheduledItems);
        const allScheduledItemsDescriptionMap = new TSMap().fromJSON(allScheduledItemsDescription);
        const productsArray = [...allAvailableProducts?.data?.products?.nodes];
        const isScheduleSuccessfull = !actionData?.error as boolean;
        const discountsArray = [...allAvailableDiscounts?.data?.codeDiscountNodes?.nodes];
        const defaultCaptionContent = getDefaultCaptionContent(defaultCaption);
        const collections = [...allCollections?.data?.collections?.nodes];

        const handleCollectionFilter = (collection: string) => {
            setCollectionFilter(collection);
        };

        const handleSearchString = (searchString: string) => {
            setSearchString(searchString);
        };

        const fetcher = useFetcher();

        return (
            <div>
                <Text variant="heading2xl" as="h3">
                    Schedule
                </Text>

                <div>
                    <div style={{ paddingBottom: '2rem' }}>
                        <select
                            id="product_filter"
                            onChange={(e) => handleCollectionFilter(e.target.value)}
                        >
                            <option value="">Alle</option>
                            {collections.map((collection: ICollection, index) => (
                                <option key={index} value={collection.id}>
                                    {collection.title}
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Suche"
                            value={searchString}
                            onChange={(e) => handleSearchString(e.target.value)}
                        />
                    </div>

                    {productsArray
                        .filter((product: IShopifyProduct) => {
                            const title = product.title.toLowerCase();
                            const search = searchString.toLowerCase();
                            return title.includes(search);
                        })
                        .filter((product: IShopifyProduct) => {
                            if (collectionFilter === '') {
                                return true;
                            }
                            return product.collections?.nodes?.find((collection) => {
                                return collection?.id === collectionFilter;
                            });
                        })
                        .map((e: IShopifyProduct, key) => {
                            let productIdArr = e.id.split('/');
                            let productId = productIdArr[productIdArr.length - 1];
                            let imageUrl = e.featuredImage?.url;
                            let images = e.images?.nodes;
                            let scheduledDate = allScheduledItemsMap.get(`${productId}`) as string;
                            let scheduledItemDesc = allScheduledItemsDescriptionMap.get(
                                `${productId}`
                            ) as string;

                            let isEligibleForScheduling = false;
                            if (productId !== undefined && imageUrl !== undefined) {
                                isEligibleForScheduling = true;
                            }

                            return (
                                <div key={key}>
                                    <fetcher.Form method="post" key={`${productId}`}>
                                        <input type="hidden" name="product_id" value={productId} />
                                        <div>
                                            <Text variant="headingXl" as="h4">
                                                {e.title}
                                            </Text>

                                            <ImagePicker images={images} />
                                            <DiscountsPicker discountsArray={discountsArray} />
                                            <TextArea
                                                placeholders={customPlaceholder}
                                                scheduledItemDesc={scheduledItemDesc}
                                                product={e}
                                                defaultCaption={defaultCaptionContent}
                                            />

                                            {isEligibleForScheduling ? (
                                                <PostBtn
                                                    productId={productId}
                                                    isScheduleSuccessfull={isScheduleSuccessfull}
                                                    scheduledDate={scheduledDate}
                                                />
                                            ) : (
                                                <div>
                                                    Please make sure that you have set an image and
                                                    a description for this product
                                                </div>
                                            )}
                                            <hr />
                                        </div>
                                    </fetcher.Form>
                                </div>
                            );
                        })}
                </div>
            </div>
        );
    } catch (error) {
        return <div>There are no items to be scheduled </div>;
    }
}
