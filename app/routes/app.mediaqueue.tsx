import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { useFetcher, useLoaderData, useSubmit } from '@remix-run/react';
import { useState } from 'react';
import { publishMedia } from '~/models/instagram.server';
import { deleteMediaQueueItem, getMediaQueue } from '~/models/mediaqueue.server';
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
  const formData = await request.formData();

  const id = formData.get('id') as string;
  const imgSrcUrl = formData.get('imgSrcUrl') as string;
  const description = formData.get('description') as string;
  const isPosting = formData.get('post') !== null;
  const isRemoving = formData.get('remove') !== null;

  console.log('isPosting', isPosting, 'isRemoving:', isRemoving);

  let publishingProductId: string[] = id.split('/');
  let productId: string = publishingProductId[publishingProductId.length - 1];

  try {
    parsedProductId = parseInt(productId);
    if (isRemoving) {
      deleteMediaQueueItem(parsedProductId);
    }

    if (isPosting && imgSrcUrl.length && description.length) {
      publishMedia(imgSrcUrl, description);
      deleteMediaQueueItem(parsedProductId);
    } else {
      console.log('no image or description');
      throw new Error();
    }
  } catch (error) {
    console.log('Could not publish Queue Item:', productId);
  }

  return 'Media published and queue item deleted';
}

interface Props {}

export default function Mediaqueue(props: Props) {
  const {} = props;
  const loaderData = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  let json;
  let postMediaQueue: [PostMediaAttributes];

  try {
    json = JSON.parse(JSON.stringify(loaderData));
  } catch (error) {
    console.log('Couldnt create JSON');
  }

  postMediaQueue = json?.data?.nodes;

  return (
    <div>
      <h1>Media Queue</h1>
      {postMediaQueue?.length &&
        postMediaQueue.map((e: PostMediaAttributes, key) => {
          const id = e?.id;
          const title = e?.title;
          const description = e?.description;
          const imgSrcUrl = e?.images?.nodes[0]?.url;
          const isPostPublishing = fetcher?.formData?.get('id') === e.id;

          return (
            <div key={key}>
              <fetcher.Form method="post">
                <MediaQueueItem
                  id={id}
                  imgSrcUrl={imgSrcUrl}
                  description={description}
                  title={title}
                  isPostPublishing={isPostPublishing}
                />
              </fetcher.Form>
            </div>
          );
        })}
    </div>
  );
}

interface MediaQueueItemProps {
  id: string;
  imgSrcUrl: string;
  description: string;
  title: string;
  isPostPublishing: boolean;
}

export function MediaQueueItem(props: MediaQueueItemProps) {
  const { id, imgSrcUrl, description, title, isPostPublishing } = props;
  const [isItemHidden] = useState(isPostPublishing);
  let submit = useSubmit();

  return (
    <div style={{ display: `${isItemHidden && 'none'}` }}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="imgSrcUrl" value={imgSrcUrl} />
      <input type="hidden" name="description" value={description} />
      <p>title: {title}</p>
      <div style={{ display: 'flex' }}>
        <img src={imgSrcUrl} alt={title} />
        <p>description: {description}</p>
      </div>
      <button name="post" value="post" type="submit">
        Post now
      </button>
      <button name="remove" value="remove" type="submit">
        Remove Item
      </button>
      <hr />
    </div>
  );
}
