import { text } from "stream/consumers";
import { IShopifyProduct } from "~/types/types";

namespace textUtils {


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

    /**
         * Replaces placeholders in a given description string with the corresponding content from products or custom placeholders.
         * This function processes a description text by substituting placeholders, defined by a list of static or custom placeholders,
         * with their respective values derived from product data or explicitly provided custom placeholder values.
         *
         * @param {string} description - The text containing placeholders to be replaced.
         * @param {any} product - The product object containing values that might be used to replace some of the placeholders.
         * @param {CustomPlaceholder[] | null | undefined} customPlaceholders - An array of custom placeholders, or null/undefined if none are provided.
         *        Each custom placeholder should have a `customPlaceholderName` and a `customPlaceholderContent`.
         * @returns {string} The description text with all placeholders replaced by their respective values.
     */
    export function replacePlaceholders(description: string, product: any, customPlaceholders: CustomPlaceholder[] | null | undefined): string {

        let replacements: Record<string, string> = { ['']: "" }

        if (customPlaceholders !== null && customPlaceholders !== undefined) {
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


    /**
        * Sanitizes the input string to ensure it only contains uppercase letters, numbers, and underscores,
        * and then wraps it with curly braces.
        * @param textInput - The string to be sanitized.
        * @returns The sanitized string.
    */
    export function placeholderSanitizer(textInput: string): string {
        console.log("SANITIZING STARTED");

        textInput = textInput.toUpperCase();
        console.log("UPPERCASING", textInput);
        textInput = textInput.replace(/[^A-Z0-9_]/g, '');
        console.log("REPLACING STARTED", textInput);

        return `{${textInput}}`
    }
}

export default textUtils