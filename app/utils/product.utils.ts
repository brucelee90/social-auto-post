import { createAdminApiClient } from "@shopify/admin-api-client";
import { IShopifyProduct } from "~/types/types";
import { queries } from "./queries";

const apiVersion = "2024-01"

export async function fetchProductData(productId: string, shop: string) {

    const { accessToken } = await prisma.session.findFirstOrThrow({
        where: {
            shop: shop
        },
        select: {
            accessToken: true
        }
    })

    const client = createAdminApiClient({
        storeDomain: shop,
        apiVersion: apiVersion,
        accessToken: accessToken,
    });

    const variables = { variables: { id: productId } };
    const { data, errors, extensions } = await client.request(queries.getSingleProductById, variables);
    return { product: data.product as IShopifyProduct, errors: errors, extensions: extensions };
}