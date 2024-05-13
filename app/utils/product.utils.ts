import { createAdminApiClient } from "@shopify/admin-api-client";
import { IShopifyProduct } from "~/routes/global_utils/types";
import { queries } from "./queries";

const apiVersion = "2024-01"

export async function fetchProductData(productId: string, sessionId: string) {

    const { accessToken, shop } = await prisma.session.findFirstOrThrow({
        where: {
            id: sessionId
        },
        select: {
            accessToken: true,
            shop: true
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