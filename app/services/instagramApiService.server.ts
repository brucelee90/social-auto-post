import { PostPageCarouselMediaRequest, PostPagePhotoMediaRequest, PostPublishMediaRequest, PostPageStoriesPhotoMediaRequest } from 'instagram-graph-api'
import { createAdminApiClient } from '@shopify/admin-api-client';
import { queries } from '~/utils/queries';
import { IShopifyProduct } from '~/types/types';
import { replacePlaceholders } from '~/utils/textUtils';



interface InstagramApiService {
    publishMedia: (featuredImageUrl: string[], caption: string) => Promise<void>
    publishCarousel: (featuredImageUrl: string[], caption: string) => Promise<void>
    publishStoryMedia: (image: string) => Promise<void>
}

const ACCESS_TOKEN = process.env.ACCESS_TOKEN as string
const PAGE_ID = process.env.PAGE_ID as string

const instagramApiService = {} as InstagramApiService

instagramApiService.publishMedia = async function publishMedia(featuredImageUrlArray: string[], caption: string) {

    const shop = 'l4-dev-shop.myshopify.com'
    const productId = "6950087655615"

    const { product } = await fetchProductData(shop, productId);
    caption = replacePlaceholders(caption, product);

    let featuredImageUrl = ""
    if (featuredImageUrlArray.length > 1) {
        instagramApiService.publishCarousel(featuredImageUrlArray, caption)
        return
    } else {
        featuredImageUrl = featuredImageUrlArray[0]
    }

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
        throw new Error(`An error occured while posting: ${featuredImageUrl}`)
    }
};

instagramApiService.publishCarousel = async function (images: string[], caption: string) {
    let childContainerId: string[] = []
    try {
        if ((ACCESS_TOKEN && PAGE_ID) != undefined) {
            async function asyncCreateCarouselReq(imageUrl: string) {
                let pagePhotoMediaRequest = new PostPagePhotoMediaRequest(ACCESS_TOKEN, PAGE_ID, imageUrl);
                return await pagePhotoMediaRequest.execute()
            }
            let arr = images.map(async imageUrl => asyncCreateCarouselReq(imageUrl));
            Promise.all(arr).then(async (containerIds) => {
                containerIds.map(e => childContainerId.push(e.getData().id))
                const carouselRequest: PostPageCarouselMediaRequest = new PostPageCarouselMediaRequest(ACCESS_TOKEN, PAGE_ID, childContainerId, caption)
                const containerId = await carouselRequest.execute()
                const publishMediaRequest: PostPublishMediaRequest = new PostPublishMediaRequest(ACCESS_TOKEN, PAGE_ID, containerId.getData().id);
                publishMediaRequest.execute().then(res => console.log('res:', res)).catch(e => console.log("Could not post", e))
            });
        } else {
            let accessTokenMessage = process.env.ACCESS_TOKEN === undefined ? "No Access Token available" : ""
            let pageIdMessage = process.env.PAGE_ID === undefined ? "No Page ID available" : ""
            throw new Error(`An error occured while posting: ${accessTokenMessage} ${pageIdMessage}`)
        }
    } catch (error) {
        console.log("Carousel could not be published:", error);
    }
}

instagramApiService.publishStoryMedia = async function (imageUrl: string) {
    if (process.env.ACCESS_TOKEN && process.env.PAGE_ID != undefined) {
        const storiesPhotoMediaReq: PostPageStoriesPhotoMediaRequest = new PostPageStoriesPhotoMediaRequest(process.env.ACCESS_TOKEN, process.env.PAGE_ID, imageUrl)
        const containerId = await storiesPhotoMediaReq.execute();
        const publishMediaRequest: PostPublishMediaRequest = new PostPublishMediaRequest(process.env.ACCESS_TOKEN, process.env.PAGE_ID, containerId.getData().id);
        publishMediaRequest.execute().then(res => console.log('res:', res)).catch(e => console.log("Could not post", e))
    }
}

async function fetchProductData(shop: string, productId: string) {

    const client = createAdminApiClient({
        storeDomain: 'l4-dev-shop.myshopify.com',
        apiVersion: '2024-01',
        accessToken: "shpua_d5774321a2442c12a664c8724befea91",
    });

    const variables = { variables: { id: `gid://shopify/Product/${productId}` } };
    const { data, errors, extensions } = await client.request(queries.getSingleProductById, variables);
    return { product: data.product as IShopifyProduct, errors: errors, extensions: extensions };
}

export default instagramApiService