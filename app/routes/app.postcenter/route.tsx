import { useState } from 'react';
import { type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { authenticate } from '~/shopify.server';
import { queries } from '~/utils/queries';
import { BlockStack, Card, Page, Text } from '@shopify/polaris';
import instagramApiService from '~/instagram/instagram.service.server';
import { Action, PlaceholderVariable, PostForm, PublishType } from '../global_utils/enum';
import ImagePicker from '~/routes/ui.components/ImagePicker/ImagePicker';
import TextArea from '~/routes/ui.components/TextArea/TextArea';
import { IShopifyProduct } from '~/routes/global_utils/types';
import { shopSettingsService } from '~/services/SettingsService.server';
import AccountNotConnected from '~/ui.components/AccountNotConnected/AccountNotConnected';
import SearchAndFilterBar from '../ui.components/SearchAndFilterBar/SearchAndFilterBar';

function createApiResponse(
    error: boolean,
    message: string,
    allAvailableProducts: any = null,
    allAvailableDiscounts: any = null,
    allCollections: any = null,
    shopSettings: any = null
) {
    return {
        error: error,
        message: message,
        allAvailableProducts: allAvailableProducts,
        allAvailableDiscounts: allAvailableDiscounts,
        allCollections: allCollections,
        customPlaceholder: shopSettings?.settings?.customPlaceholder,
        defaultCaption: shopSettings?.settings?.defaultCaption,
        fbAccessToken: shopSettings?.settings.facebookAccessToken,
        fbPageId: shopSettings?.settings.facebookPageId
    };
}

export async function loader({ request }: LoaderFunctionArgs) {
    const { admin, session } = await authenticate.admin(request);
    const { id: sessionId } = session;

    try {
        const [allAvailableProducts, allAvailableDiscounts, allCollections, shopSettings] =
            await Promise.all([
                admin.graphql(`${queries.getAllProducts}`).then((res) => res.json()),
                admin.graphql(`${queries.queryAllDiscounts}`).then((res) => res.json()),
                admin.graphql(`${queries.getAllCollections}`).then((res) => res.json()),
                shopSettingsService.getShopSettings(sessionId)
            ]);

        return createApiResponse(
            false,
            '',
            allAvailableProducts,
            allAvailableDiscounts,
            allCollections,
            shopSettings
        );
    } catch (error) {
        return createApiResponse(true, 'an error occured:' + error);
    }
}

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const { session, redirect } = await authenticate.admin(request);
    const { id: sessionId } = session;

    const imageUrl = formData.getAll(PostForm.imgUrl) as string[];
    const postDescription = formData.get(PostForm.description) as string;
    const productId = formData.get('product_id') as string;
    // const fbAccessToken = formData.get('fb_access_token') as string;
    // const fbPageId = formData.get('fb_page_id') as string;
    const publishAction = formData.getAll(Action.post) as string[];
    const codeDiscount = formData.get(PostForm.codeDiscount) as string;

    try {
        let description = postDescription.replace(PlaceholderVariable.codeDiscount, codeDiscount);
        if (publishAction.includes(PublishType.publishStory)) {
            await instagramApiService.publishStoryMedia(imageUrl[0], sessionId);
        } else if (publishAction.includes(PublishType.publishMedia)) {
            await instagramApiService.publishMedia(imageUrl, description, productId, sessionId);
        }

        return { message: 'PUBLISHED SUCCESFULLY !', error: false, productId: productId };
    } catch (error) {
        return { message: `error`, error: true, productId: productId };
    }
};

export default function PublishMedia() {
    const [collectionFilter, setCollectionFilter] = useState('');
    const [searchString, setSearchString] = useState('');
    const actionData = useActionData<typeof action>();

    const {
        allAvailableProducts,
        allAvailableDiscounts,
        customPlaceholder,
        allCollections,
        fbAccessToken,
        fbPageId
    } = useLoaderData<typeof loader>();

    const productsArray = [...allAvailableProducts?.data?.products?.nodes];
    const collections = [...allCollections?.data?.collections?.nodes];
    const discountsArray = [...allAvailableDiscounts?.data?.codeDiscountNodes?.nodes];

    const handleCollectionFilter = (collection: string) => {
        setCollectionFilter(collection);
    };

    const handleSearchString = (searchString: string) => {
        setSearchString(searchString);
    };

    return (
        <Page
            fullWidth
            title="Postcenter"
            primaryAction={
                <SearchAndFilterBar
                    collections={collections}
                    searchString={searchString}
                    handleCollectionFilter={handleCollectionFilter}
                    handleSearchString={handleSearchString}
                />
            }
        >
            {!fbAccessToken || !fbPageId ? (
                <div>
                    <AccountNotConnected />
                </div>
            ) : (
                <BlockStack gap="600">
                    {productsArray &&
                        productsArray
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
                            .map((product: IShopifyProduct, key) => {
                                let productId = product.id;
                                let images = product.images?.nodes;
                                let title = product.title;
                                let description = product.description;

                                return (
                                    <Card key={key} padding={'800'}>
                                        <Form method="post">
                                            <input
                                                type="hidden"
                                                name="product_id"
                                                value={productId}
                                            />
                                            <input
                                                type="hidden"
                                                name="fb_access_token"
                                                value={fbAccessToken != null ? fbAccessToken : ''}
                                            />

                                            <input
                                                type="hidden"
                                                name="fb_page_id"
                                                value={fbPageId != null ? fbPageId : ''}
                                            />
                                            <div key={key} id={productId}>
                                                <BlockStack gap={'400'}>
                                                    <Text variant="headingXl" as="h4">
                                                        {title}
                                                    </Text>

                                                    <ImagePicker images={images} />
                                                    {/* <DiscountsPicker discountsArray={discountsArray} /> */}
                                                    <TextArea
                                                        placeholders={customPlaceholder}
                                                        product={product}
                                                        defaultCaption={undefined}
                                                    />

                                                    <div>
                                                        {images ? (
                                                            <div>
                                                                <button
                                                                    type="submit"
                                                                    name={Action.post}
                                                                    value={PublishType.publishMedia}
                                                                    className="Polaris-Button Polaris-Button--pressable Polaris-Button--variantPrimary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter me-3"
                                                                >
                                                                    PUBLISH MEDIA
                                                                </button>
                                                                <button
                                                                    type="submit"
                                                                    name={Action.post}
                                                                    value={PublishType.publishStory}
                                                                    className="Polaris-Button Polaris-Button--pressable Polaris-Button--variantTertiary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter"
                                                                >
                                                                    PUBLISH STORY
                                                                </button>
                                                                {actionData?.productId ===
                                                                    productId && (
                                                                    <div>{actionData.message}</div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                This product can not be posted.
                                                                Please make sure your product has an
                                                                image
                                                            </div>
                                                        )}
                                                    </div>
                                                </BlockStack>
                                            </div>
                                        </Form>
                                    </Card>
                                );
                            })}
                </BlockStack>
            )}
        </Page>
    );
}
