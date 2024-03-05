import { PostPagePhotoMediaRequest, PostPublishMediaRequest } from 'instagram-graph-api'

export async function publishMedia(featuredImageUrl: string, caption: string) {

    try {

        if (process.env.ACCESS_TOKEN && process.env.PAGE_ID != undefined) {
            const pagePhotoMediaRequest: PostPagePhotoMediaRequest = new PostPagePhotoMediaRequest(process.env.ACCESS_TOKEN, process.env.PAGE_ID, featuredImageUrl, caption)
            const containerId = await pagePhotoMediaRequest.execute();
            const publishMediaRequest: PostPublishMediaRequest = new PostPublishMediaRequest(process.env.ACCESS_TOKEN, process.env.PAGE_ID, containerId.getData().id);
            publishMediaRequest.execute().then(res => console.log('res:', res)).catch(e => console.log("Could not post", e)
            )
        } else {
            let accessTokenMessage = process.env.ACCESS_TOKEN === undefined ? "No Access Token available" : ""
            let pageIdMessage = process.env.PAGE_ID === undefined ? "No Page ID available" : ""
            throw new Error(`An error occured while posting: ${accessTokenMessage} ${pageIdMessage}`)
        }

    } catch (error) {
        console.log(error);
    }

};