import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { MediaQueueItem } from '~/routes/ui.components/mediaqueue/MediaQueueItem';
import instagramApiService from '~/instagram/instagram.service.server';
import { deleteMediaQueueItem, getMediaQueue } from '~/controllers/mediaqueue.server';
import { logger } from '~/utils/logger.server';
import { authenticate } from '~/shopify.server';
import { PostMediaAttributes } from '~/types/types';
import { queries } from '~/utils/queries';

export async function loader({ request }: LoaderFunctionArgs) {
    const { session, admin } = await authenticate.admin(request);
    const { shop } = session;

    try {
        const mediaQueueIds: string[] = [];
        const mediaQueue = await getMediaQueue(shop);

        mediaQueue.map((e: any) => {
            mediaQueueIds.push(`gid://shopify/Product/${e?.productId}`);
        });

        const response = await admin.graphql(`${queries.queryProductsById}`, {
            variables: { ids: mediaQueueIds }
        });

        const responseJson = await response.json();

        if (responseJson) {
            return responseJson;
        } else {
            throw new Error();
        }
    } catch (error) {
        return "Media couldn't be fetched";
    }
}

export async function action({ request }: ActionFunctionArgs) {
    let parsedProductId: number;
    let actionMessage: string;

    const formData = await request.formData();
    const id = formData.get('id') as string;
    const imgSrcUrl = formData.getAll('imgSrcUrl') as string[];
    const description = formData.get('description') as string;
    const isPosting = formData.get('post') !== null;
    const isRemoving = formData.get('remove') !== null;

    let publishingProductId: string[] = id.split('/');
    let productId: string = publishingProductId[publishingProductId.length - 1];

    try {
        parsedProductId = parseInt(productId);
        if (isRemoving === true) {
            deleteMediaQueueItem(parsedProductId);
            actionMessage = 'Item removed from Media queue successfully';
        } else if (isPosting === true && imgSrcUrl.length && description.length) {
            instagramApiService.publishMedia(imgSrcUrl, description, '', '');
            deleteMediaQueueItem(parsedProductId);
            actionMessage = 'Item was posted successfully';
        } else {
            logger.warn('no image or description for product: ', parsedProductId);
            actionMessage = 'An error occured. Please try again or contact administrator';
            throw new Error();
        }

        return { error: false, actionMessage: actionMessage, id: id };
    } catch (error) {
        logger.error('no image or description for product: ', productId);
        actionMessage = 'An error occured. Please try again or contact administrator';
        return { error: true, actionMessage: actionMessage, id: id };
    }
}

export default function Mediaqueue() {
    const loaderData = useLoaderData<typeof loader>();
    const fetcher = useFetcher<typeof fetch>();

    let postMediaQueue: [PostMediaAttributes];
    let json;

    try {
        json = JSON.parse(JSON.stringify(loaderData));
    } catch (error) {
        logger.error('Could not create JSON from loaderData:', loaderData);
    }

    postMediaQueue = json?.data?.nodes;

    return (
        <div>
            <h1>Media Queue</h1>
            {postMediaQueue?.length
                ? postMediaQueue.map((e: PostMediaAttributes, key) => {
                      const id = e?.id;
                      const title = e?.title;
                      const description = e?.description;
                      const imgSrcUrl = e?.images?.nodes[0]?.url;
                      const isItemRemoving = fetcher?.formData?.get('id') === e.id;
                      const isFailedDeletion = fetcher.data?.error && fetcher?.data?.id === e.id;

                      return (
                          <div key={key}>
                              <fetcher.Form method="post">
                                  <MediaQueueItem
                                      id={id}
                                      imgSrcUrl={imgSrcUrl}
                                      description={description}
                                      title={title}
                                      isItemRemoving={isItemRemoving}
                                      isFailedDeletion={isFailedDeletion}
                                  />
                              </fetcher.Form>
                          </div>
                      );
                  })
                : 'There are currently no items in this queue'}
        </div>
    );
}
