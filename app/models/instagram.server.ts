import { PostPagePhotoMediaRequest, PostPublishMediaRequest } from 'instagram-graph-api'

export async function publishMedia(featuredImageUrl : string, caption : string) {

    if (process.env.ACCESS_TOKEN && process.env.PAGE_ID != undefined) {
        const pagePhotoMediaRequest : PostPagePhotoMediaRequest = new PostPagePhotoMediaRequest(process.env.ACCESS_TOKEN, process.env.PAGE_ID, featuredImageUrl, caption)
        const containerId = await pagePhotoMediaRequest.execute();
        const publishMediaRequest : PostPublishMediaRequest = new PostPublishMediaRequest(process.env.ACCESS_TOKEN, process.env.PAGE_ID, containerId.getData().id);
        publishMediaRequest.execute().then(res => console.log('res:', res))
    }
};