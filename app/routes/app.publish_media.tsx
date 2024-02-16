import { useLoaderData } from '@remix-run/react';

import { ContainerField, GetContainerRequest, PostPagePhotoMediaRequest, PostPublishMediaRequest } from 'instagram-graph-api'
import React from 'react'

interface Props {}

export async function publishMedia() {

    if (process.env.ACCESS_TOKEN && process.env.PAGE_ID != undefined) {

        let req : PostPagePhotoMediaRequest = new PostPagePhotoMediaRequest(process.env.ACCESS_TOKEN, process.env.PAGE_ID, "https://placehold.co/500x500")
        
        let containerId = await req.execute();
        console.log('containerId', containerId.getData().id);

        let containerReq = new GetContainerRequest(process.env.ACCESS_TOKEN, containerId.getData().id, ContainerField.STATUS_CODE)
        let statusCode = await containerReq.execute()
        console.log('status Code:', statusCode.getContainerStatusCode());


        let pub : PostPublishMediaRequest = new PostPublishMediaRequest(process.env.ACCESS_TOKEN, process.env.PAGE_ID, containerId.getData().id);
        pub.execute().then(res => console.log('res:', res))

        

    }
};

export async function loader() {

    try {
            publishMedia()
            return null;

        
    } catch (error) {
        throw new Error("ACCESS TOKEN UND PAGE ID CHECKEN; publish_media, row 30");
    }
    
}

export default function PublishMedia(props: Props) {
    const {} = props

    const ig_res  = useLoaderData<typeof loader>();
    console.log('ig_res:', ig_res);
    
    

    return (
        <div onClick={publishMedia}>POST MEDIA</div>
    )
}