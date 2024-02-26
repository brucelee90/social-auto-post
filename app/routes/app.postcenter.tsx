import React from 'react';

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { authenticate } from '~/shopify.server';
import { publishMedia } from '~/models/instagram.server';
import { queries } from '~/utils/queries';

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const res = await admin.graphql(`${queries.queryAllProducts}`);
  return res.json();
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const featuredImageUrl = formData.get('featuredImageUrl') as string;
  const customUserDescription = formData.get('customUserDescription') as string;
  const selectedProductDescription = formData.get('selectedProductDescription') as string;

  let postDescription = customUserDescription;
  if (!postDescription?.length) {
    postDescription = selectedProductDescription;
  }

  try {
    publishMedia(featuredImageUrl, postDescription);
    return 'PUBLISHED IMAGE SUCCESFULLY !';
  } catch (error) {
    return 'An error occured while posting';
  }
};

interface Props {}

export default function PublishMedia(props: Props) {
  const [textareaInput, setTextareaInput] = React.useState('');
  const [selectedProductId, setSelectedProductId] = React.useState('');

  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const productsArray = [...loaderData.data.products.nodes];

  const handleChange = (e: any) => {
    setSelectedProductId(e.target.id);
  };

  const handleTextAreaInput = (e: any) => {
    setTextareaInput(e.target.value);
  };

  const selectedProductDescription = productsArray.find(
    (obj) => obj.id === selectedProductId
  )?.description;
  const isCustomDescription = true;

  return (
    <Form method="post">
      {productsArray.map((e, key) => {
        return (
          <div key={key}>
            <input
              type="radio"
              id={e.id}
              name="featuredImageUrl"
              value={e.featuredImage.url}
              onChange={handleChange}
            />
            <img alt="img" width={'150px'} src={e.featuredImage.url} />
            <label htmlFor="featuredImageUrl">{e.title}</label>
            <div style={{ width: '30rem', background: '#ccc' }}>{e.description}</div>
          </div>
        );
      })}

      {isCustomDescription && (
        <textarea
          rows={4}
          name="customUserDescription"
          onInput={handleTextAreaInput}
          value={textareaInput}
          cols={50}
        />
      )}
      <input type="hidden" name="selectedProductDescription" value={selectedProductDescription} />

      <button type="submit">PUBLISH MEDIA</button>
      {actionData && <div>{actionData}</div>}
    </Form>
  );
}
