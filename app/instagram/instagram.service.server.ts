import { PostPageCarouselMediaRequest, PostPagePhotoMediaRequest, PostPublishMediaRequest, PostPageStoriesPhotoMediaRequest } from 'instagram-graph-api'

import { shopSettingsService } from '../services/SettingsService.server';
import { fetchProductData } from '~/utils/product.utils';
import textUtils from '~/utils/textUtils';

interface InstagramApiService {
    publishMedia: (featuredImageUrl: string[], caption: string, prodId: string, shop: string) => Promise<void>
    publishCarousel: (featuredImageUrl: string[], caption: string, accessToken: string, pageId: string) => Promise<void>
    publishStoryMedia: (image: string, sessionId: string) => Promise<void>
}

// const ACCESS_TOKEN = process.env.ACCESS_TOKEN as string
// const PAGE_ID = process.env.PAGE_ID as string

const instagramApiService = {} as InstagramApiService

instagramApiService.publishMedia = async function (featuredImageUrlArray: string[], caption: string, productId: string, sessionId: string) {



    let accessToken = ""
    let pageId = ""

    try {
        const { product } = await fetchProductData(productId, sessionId);
        let shopSettings = await shopSettingsService.getShopSettings(sessionId)
        caption = textUtils.replacePlaceholders(caption, product, shopSettings?.settings?.customPlaceholder);
        accessToken = shopSettings?.settings?.facebookAccessToken as string
        pageId = shopSettings?.settings?.facebookPageId as string
        if (accessToken == null || pageId == null) {
            throw new Error("accessToken or pageId is null or undefined");
        }
    } catch (error) {
        console.log("error while creating placeholders", productId, sessionId, "accessToken:", accessToken, "pageId:", pageId);
    }

    let featuredImageUrl = ""
    if (featuredImageUrlArray.length > 1) {
        instagramApiService.publishCarousel(featuredImageUrlArray, caption, accessToken, pageId)
        return
    } else {
        featuredImageUrl = featuredImageUrlArray[0]
    }

    try {
        if (accessToken && pageId != undefined && featuredImageUrl.length) {
            const pagePhotoMediaRequest: PostPagePhotoMediaRequest = new PostPagePhotoMediaRequest(accessToken, pageId, featuredImageUrl, caption)
            const containerId = await pagePhotoMediaRequest.execute();
            const publishMediaRequest: PostPublishMediaRequest = new PostPublishMediaRequest(accessToken, pageId, containerId.getData().id);
            publishMediaRequest.execute().then(res => console.log('res:', res)).catch(e => console.log("Could not post", e)
            )
        } else {
            let accessTokenMessage = accessToken === undefined ? "No Access Token available" : ""
            let pageIdMessage = pageId === undefined ? "No Page ID available" : ""
            throw new Error(`An error occured while posting: ${accessTokenMessage} ${pageIdMessage}`)
        }

    } catch (error) {
        console.log(`An error occured while posting featuredImageUrl: ${featuredImageUrl} featuredImageUrl.length: ${featuredImageUrl.length} `);
    }
};

instagramApiService.publishCarousel = async function (images: string[], caption: string, accessToken: string, pageId: string) {
    let childContainerId: string[] = []
    try {
        if ((accessToken && pageId) != undefined) {
            async function asyncCreateCarouselReq(imageUrl: string) {
                let pagePhotoMediaRequest = new PostPagePhotoMediaRequest(accessToken, pageId, imageUrl);
                return await pagePhotoMediaRequest.execute()
            }
            let arr = images.map(async imageUrl => asyncCreateCarouselReq(imageUrl));
            Promise.all(arr).then(async (containerIds) => {
                containerIds.map(e => childContainerId.push(e.getData().id))
                const carouselRequest: PostPageCarouselMediaRequest = new PostPageCarouselMediaRequest(accessToken, pageId, childContainerId, caption)
                const containerId = await carouselRequest.execute()
                const publishMediaRequest: PostPublishMediaRequest = new PostPublishMediaRequest(accessToken, pageId, containerId.getData().id);
                publishMediaRequest.execute().then(res => console.log('res:', res)).catch(e => console.log("Could not post", e))
            });
        } else {
            let accessTokenMessage = accessToken === undefined ? "No Access Token available" : ""
            let pageIdMessage = pageId === undefined ? "No Page ID available" : ""
            throw new Error(`An error occured while posting: ${accessTokenMessage} ${pageIdMessage}`)
        }
    } catch (error) {
        console.log("Carousel could not be published:", error);
    }
}

instagramApiService.publishStoryMedia = async function (imageUrl: string, sessionId: string) {

    let accessToken
    let pageId
    try {

        let shopSettings = await shopSettingsService.getShopSettings(sessionId)
        accessToken = shopSettings?.settings?.facebookAccessToken as string
        pageId = shopSettings?.settings?.facebookPageId as string
        if (accessToken == null || pageId == null) {
            throw new Error("accessToken or pageId is null or undefined");
        }
    } catch (error) {
        console.log("error while creating story", sessionId, "accessToken:", accessToken, "pageId:", pageId);
    }

    if (accessToken && pageId != undefined) {
        const storiesPhotoMediaReq: PostPageStoriesPhotoMediaRequest = new PostPageStoriesPhotoMediaRequest(accessToken, pageId, imageUrl)
        const containerId = await storiesPhotoMediaReq.execute();
        const publishMediaRequest: PostPublishMediaRequest = new PostPublishMediaRequest(accessToken, pageId, containerId.getData().id);
        publishMediaRequest.execute().then(res => console.log('res:', res)).catch(e => console.log("Could not post", e))
    }
}

export default instagramApiService