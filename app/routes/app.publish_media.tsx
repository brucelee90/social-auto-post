

import type { ActionFunctionArgs, LoaderFunctionArgs} from '@remix-run/node';
// import { redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
// import { request } from 'axios';
import { ContainerField, GetContainerRequest, PostPagePhotoMediaRequest, PostPublishMediaRequest } from 'instagram-graph-api'
import React from 'react'
import { authenticate } from '~/shopify.server';
// import { redirect } from 'react-router';
// import { redirect } from 'react-router';

interface Props {}


export async function publishMedia() {

    if (process.env.ACCESS_TOKEN && process.env.PAGE_ID != undefined) {

        let req : PostPagePhotoMediaRequest = new PostPagePhotoMediaRequest(process.env.ACCESS_TOKEN, process.env.PAGE_ID, "https://sneakernews.com/wp-content/uploads/2020/02/off-white-air-jordan-5-virgil-abloh-nike-snkrs-1.jpg")
        
        let containerId = await req.execute();
        console.log('containerId', containerId.getData().id);

        let containerReq = new GetContainerRequest(process.env.ACCESS_TOKEN, containerId.getData().id, ContainerField.STATUS_CODE)
        let statusCode = await containerReq.execute()
        console.log('status Code:', statusCode.getContainerStatusCode());


        let pub : PostPublishMediaRequest = new PostPublishMediaRequest(process.env.ACCESS_TOKEN, process.env.PAGE_ID, containerId.getData().id);
        pub.execute().then(res => console.log('res:', res))
    }
};

export async function loader({request} : LoaderFunctionArgs ) {
  const {admin} = await authenticate.admin(request);
  const res = await admin.graphql(
    `
      query products {
        products (first:50, query:"status:active AND published_status:published") {
        nodes{
          description
          featuredImage{
            url
          }
        }
      }
    }
    `
  )

  return res.json();

}

export const action = async ({
    request,
  }: ActionFunctionArgs) => {
    const formData = await request.formData();
    console.log('formData:', formData.getAll('name'));

    publishMedia()
    
    return 'PUBLISHED IMAGE SUCCESFULLY !';
  };

export default function PublishMedia(props: Props) {
    const {} = props


    const actionData = useActionData<typeof action>();
    console.log(actionData);

    const data = useLoaderData<typeof loader>();
    // const edges : [{}] = {...loaderData.data.products.edges}
    
    console.log('loaderData', [...data.data.products.nodes] );

    const productsArray = [...data.data.products.nodes]

    productsArray.map(e => {
      console.log('Product description', e.description);
      console.log('Product image url', e.featuredImage.url);
    })
    

    return (
        <Form method="post">

          {
            productsArray.map((e, key) => {return (
              <div key={key}>
                <img alt='img' width={"500px"} src={e.featuredImage.url}/>
                <p>{e.description}</p>
              </div>
            )})
          }
        
          <button type="submit">PUBLISH MEDIA</button>

          {actionData && (
            <div>{actionData}</div>
          )}
        
      </Form>
    )
}