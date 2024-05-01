import { IShopifyProduct } from "~/types/types";


const placeholderMap: { [key: string]: (product: IShopifyProduct) => string } = {
    "{PRODUCT_ID}": (product: IShopifyProduct) => product.id ?? "",
    "{PRODUCT_TITLE}": (product: IShopifyProduct) => product.title ?? "",
    "{PRODUCT_DESCRIPTION}": (product: IShopifyProduct) => product.description ?? "",
    "{PRODUCT_TAGS}": (product: IShopifyProduct) => product.tags?.map((tag: string) => `#${tag}`).join(' ') ?? "",
    "{PRODUCT_MIN_PRICE}": (product: IShopifyProduct) => `${product.priceRangeV2?.minVariantPrice?.amount ?? ""} ${product.priceRangeV2?.minVariantPrice?.currencyCode ?? ""}`,
    "{PRODUCT_MAX_PRICE}": (product: IShopifyProduct) => `${product.priceRangeV2?.maxVariantPrice?.amount ?? ""} ${product.priceRangeV2?.maxVariantPrice?.currencyCode ?? ""}`,
    "{PRODUCT_MIN_COMPARE_AT_PRICE}": (product: IShopifyProduct) => `${product.compareAtPriceRange?.minVariantCompareAtPrice?.amount ?? ""} ${product.compareAtPriceRange?.minVariantCompareAtPrice?.currencyCode ?? ""}`,
    "{PRODUCT_MAX_COMPARE_AT_PRICE}": (product: IShopifyProduct) => `${product.compareAtPriceRange?.maxVariantCompareAtPrice?.amount ?? ""} ${product.compareAtPriceRange?.maxVariantCompareAtPrice?.currencyCode ?? ""}`,
};

export function replacePlaceholders(text: string, product: IShopifyProduct): string {
    for (const [placeholder, extractor] of Object.entries(placeholderMap)) {
        text = text.replace(placeholder, extractor(product));
    }

    return text;
}