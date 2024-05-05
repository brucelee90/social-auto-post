import { Form } from '@remix-run/react';
import { Text } from '@shopify/polaris';
import { PostBtn } from './PostBtn';
import { TSMap } from 'typescript-map';
import ImagePicker from '~/components/PostRow/ImagePicker';
import TextArea from '~/components/PostRow/TextArea';
import DiscountsPicker from '~/components/PostRow/DiscountsPicker';
import { ICollection, IShopifyProduct } from '~/types/types';
import { useState } from 'react';

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

function PostItem(props: Props) {
    const [collectionFilter, setCollectionFilter] = useState('');
    const [searchString, setSearchString] = useState('');
    const {
        actionProductId,
        actionMessage,
        isScheduleSuccessfull,
        action,
        productsArray,
        allScheduledItemsMap,
        allScheduledItemsDescriptionMap,
        discountsArray,
        placeholders,
        defaultCaption,
        collections
    } = props;

    const handleCollectionFilter = (collection: string) => {
        setCollectionFilter(collection);
    };

    const handleSearchString = (searchString: string) => {
        setSearchString(searchString);
    };

    return (
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
                            <Form method="post">
                                <input type="hidden" name="product_id" value={productId} />
                                <div>
                                    <Text variant="headingXl" as="h4">
                                        {e.title}
                                    </Text>

                                    <ImagePicker images={images} />
                                    <DiscountsPicker discountsArray={discountsArray} />
                                    <TextArea
                                        placeholders={placeholders}
                                        scheduledItemDesc={scheduledItemDesc}
                                        product={e}
                                        defaultCaption={defaultCaption}
                                    />

                                    {isEligibleForScheduling ? (
                                        <PostBtn
                                            actionProductId={actionProductId}
                                            productId={productId}
                                            actionMessage={actionMessage}
                                            isScheduleSuccessfull={isScheduleSuccessfull}
                                            scheduledDate={scheduledDate}
                                            action={action}
                                        />
                                    ) : (
                                        <div>
                                            Please make sure that you have set an image and a
                                            description for this product
                                        </div>
                                    )}
                                    <hr />
                                </div>
                            </Form>
                        </div>
                    );
                })}
        </div>
    );
}

export default PostItem;
