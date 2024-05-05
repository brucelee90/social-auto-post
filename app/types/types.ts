export interface PostMediaAttributes {
    id: string,
    title: string,
    description: string
    images: {
        nodes: [{
            url: string
        }]
    }
}

export interface ICollection {

    id: string,
    title: string

}





export interface IShopifyProduct {
    id: string;
    title: string;
    description: string;
    tags: string[];
    featuredImage: { url: string };
    images: { nodes: [{ url: string }] };
    priceRangeV2?: {
        minVariantPrice?: {
            amount?: string;
            currencyCode?: string;
        };
        maxVariantPrice?: {
            amount?: string;
            currencyCode?: string;
        };
    };
    compareAtPriceRange?: {
        minVariantCompareAtPrice?: {
            amount?: string;
            currencyCode?: string;
        };
        maxVariantCompareAtPrice?: {
            amount?: string;
            currencyCode?: string;
        };
    };
    collections?: {
        nodes: [{
            id: string
            title: string
        }]
    }
}