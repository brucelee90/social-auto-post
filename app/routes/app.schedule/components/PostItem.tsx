import { Form } from '@remix-run/react';
import { Text } from '@shopify/polaris';
import { PostBtn } from './PostBtn';
import { TSMap } from 'typescript-map';
import { ProductInfo } from '../../global_utils/types';
import { PostForm } from '~/routes/global_utils/enum';
import ImagePicker from '~/components/PostRow/ImagePicker';
import TextArea from '~/components/PostRow/TextArea';

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

    console.log('productsArray:', productsArray);

    return (
        <div>
            {productsArray.map((e: ProductInfo, key) => {
                let productIdArr = e.id.split('/');
                let productId = productIdArr[productIdArr.length - 1];
                let imageUrl = e.featuredImage?.url;
                let images = e.images?.nodes;
                let scheduledDate = allScheduledItemsMap.get(`${productId}`) as string;

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
                                <TextArea description={e.description} />

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
