import { IShopifyProduct } from "~/types/types";

enum PlaceholderKeyEnum {
    PRODUCT_ID = "{PRODUCT_ID}",
    PRODUCT_TITLE = "{PRODUCT_TITLE}",
    PRODUCT_DESCRIPTION = "{PRODUCT_DESCRIPTION}",
    PRODUCT_TAGS = "{PRODUCT_TAGS}",
    PRODUCT_MIN_PRICE = "{PRODUCT_MIN_PRICE}",
    PRODUCT_MAX_PRICE = "{PRODUCT_MAX_PRICE}",
    PRODUCT_MIN_COMPARE_AT_PRICE = "{PRODUCT_MIN_COMPARE_AT_PRICE}",
    PRODUCT_MAX_COMPARE_AT_PRICE = "{PRODUCT_MAX_COMPARE_AT_PRICE}",
}

type CustomPlaceholder = { customPlaceholderName: string, customPlaceholderContent: string }

type PlaceholderKey = PlaceholderKeyEnum.PRODUCT_ID
    | PlaceholderKeyEnum.PRODUCT_TITLE
    | PlaceholderKeyEnum.PRODUCT_DESCRIPTION
    | PlaceholderKeyEnum.PRODUCT_TAGS
    | PlaceholderKeyEnum.PRODUCT_MIN_PRICE
    | PlaceholderKeyEnum.PRODUCT_MAX_PRICE
    | PlaceholderKeyEnum.PRODUCT_MIN_COMPARE_AT_PRICE
    | PlaceholderKeyEnum.PRODUCT_MAX_COMPARE_AT_PRICE;

const staticPlaceholders: PlaceholderKey[] = [
    PlaceholderKeyEnum.PRODUCT_ID,
    PlaceholderKeyEnum.PRODUCT_TITLE,
    PlaceholderKeyEnum.PRODUCT_DESCRIPTION,
    PlaceholderKeyEnum.PRODUCT_TAGS,
    PlaceholderKeyEnum.PRODUCT_MIN_PRICE,
    PlaceholderKeyEnum.PRODUCT_MAX_PRICE,
    PlaceholderKeyEnum.PRODUCT_MIN_COMPARE_AT_PRICE,
    PlaceholderKeyEnum.PRODUCT_MAX_COMPARE_AT_PRICE,
];

function getProductPlaceholder(product: IShopifyProduct, key: PlaceholderKey) {
    const mappings = {
        [PlaceholderKeyEnum.PRODUCT_ID]: product.id ?? "",
        [PlaceholderKeyEnum.PRODUCT_TITLE]: product.title ?? "",
        [PlaceholderKeyEnum.PRODUCT_DESCRIPTION]: product.description ?? "",
        [PlaceholderKeyEnum.PRODUCT_TAGS]: (product.tags ?? []).map(tag => `#${tag}`).join(" "),
        [PlaceholderKeyEnum.PRODUCT_MIN_PRICE]: `${product.priceRangeV2?.minVariantPrice?.amount ?? ""} ${product.priceRangeV2?.minVariantPrice?.currencyCode ?? ""}`,
        [PlaceholderKeyEnum.PRODUCT_MAX_PRICE]: `${product.priceRangeV2?.maxVariantPrice?.amount ?? ""} ${product.priceRangeV2?.maxVariantPrice?.currencyCode ?? ""}`,
        [PlaceholderKeyEnum.PRODUCT_MIN_COMPARE_AT_PRICE]: `${product.compareAtPriceRange?.minVariantCompareAtPrice?.amount ?? ""} ${product.compareAtPriceRange?.minVariantCompareAtPrice?.currencyCode ?? ""}`,
        [PlaceholderKeyEnum.PRODUCT_MAX_COMPARE_AT_PRICE]: `${product.compareAtPriceRange?.maxVariantCompareAtPrice?.amount ?? ""} ${product.compareAtPriceRange?.maxVariantCompareAtPrice?.currencyCode ?? ""}`,
    };

    return mappings[key] ?? "";
}

function buildPlaceholderRegex(keys: PlaceholderKey[]): RegExp {
    const escapedKeys = keys.map(key => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = escapedKeys.join('|');
    return new RegExp(pattern, 'g');
}

const processText = (text: string, replacements: Record<string, string>) => {
    return Object.keys(replacements).reduce((currentText, key: string) => {
        const regex = new RegExp(key, 'g');
        return currentText.replace(regex, replacements[key]);
    }, text);
};

export function replacePlaceholders(description: string, product: any, customPlaceholders: CustomPlaceholder[] | null): string {

    let replacements: Record<string, string> = { ['']: "" }

    if (customPlaceholders !== null) {
        replacements = customPlaceholders.reduce(
            (accumulator: Record<string, string>, customPlaceholders: CustomPlaceholder) => ({
                ...accumulator,
                [`${customPlaceholders.customPlaceholderName}`]: customPlaceholders.customPlaceholderContent
            }),
            {}
        );
    }


    const placeholderRegex = buildPlaceholderRegex(staticPlaceholders);
    return processText(description, replacements).replace(placeholderRegex, match => getProductPlaceholder(product, match as PlaceholderKey));
}


