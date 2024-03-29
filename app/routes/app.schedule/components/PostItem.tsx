import { Form } from '@remix-run/react';
import { Text } from '@shopify/polaris';
import { PostBtn } from './PostBtn';
import { TSMap } from 'typescript-map';

type ProductInfo = {
    id: string;
    featuredImage: { url: string };
    title: string;
    description: string;
};

interface Props {
    actionProductId: string;
    actionMessage: string;
    isScheduleSuccessfull: boolean;
    action: string;
    productsArray: any[];
    allScheduledItemsMap: TSMap<unknown, unknown>;
}

function PostItem(props: Props) {
    const {
        actionProductId,
        actionMessage,
        isScheduleSuccessfull,
        action,
        productsArray,
        allScheduledItemsMap
    } = props;

    return (
        <div>
            {productsArray.map((e: ProductInfo, key) => {
                let productIdArr = e.id.split('/');
                let productId = productIdArr[productIdArr.length - 1];
                let imageUrl = e.featuredImage?.url;
                let scheduledDate = allScheduledItemsMap.get(`${productId}`) as string;

                let isEligibleForScheduling = false;
                if (productId !== undefined && imageUrl !== undefined) {
                    isEligibleForScheduling = true;
                }

                return (
                    <div key={key}>
                        <Form method="post">
                            <div>
                                <input type="hidden" name="product_id" value={productId} />
                                <input type="hidden" name="post_image_url" value={imageUrl} />
                                <div>
                                    <Text variant="headingXl" as="h4">
                                        {e.title}
                                    </Text>
                                    <img alt="img" width={'150px'} src={imageUrl} />
                                </div>
                                <div>
                                    <textarea
                                        style={{ width: '30rem', background: '#ccc' }}
                                        name="post_description"
                                        rows={10}
                                        defaultValue={e.description}
                                    />
                                </div>
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
