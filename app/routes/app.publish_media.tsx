

import type { ActionFunctionArgs} from '@remix-run/node';
// import { redirect } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { ContainerField, GetContainerRequest, PostPagePhotoMediaRequest, PostPublishMediaRequest } from 'instagram-graph-api'
import React from 'react'
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
    


    return (
        <Form method="post">
        
          <button type="submit">PUBLISH MEDIA</button>

          {actionData && (
            <div>{actionData}</div>
          )}
        
      </Form>
    )
}