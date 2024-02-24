import type { ActionFunctionArgs } from '@remix-run/node';
import { authenticate } from '../shopify.server';
import db from '../db.server';
import { createMediaQueueItem } from '~/models/mediaqueue.server';

interface ProductCreatePayload {
  id: number;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, session, admin, payload } = await authenticate.webhook(request);

  if (!admin) {
    // The admin context isn't returned if the webhook fired after a shop was uninstalled.
    throw new Response();
  }

  switch (topic) {
    case 'APP_UNINSTALLED':
      if (session) {
        await db.session.deleteMany({ where: { shop } });
      }

      break;

    case 'PRODUCTS_CREATE':
      let createdProductId: { productId: bigint; shopId: string } = {
        productId: BigInt(0),
        shopId: ''
      };
      const productCreatePayload: ProductCreatePayload = payload as { id: number };
      const productId = productCreatePayload?.id;

      try {
        createdProductId = await createMediaQueueItem(productId, shop);
        console.log('--- SAVED ---', productId, typeof productId, createdProductId);
      } catch (error) {
        console.log('ERROR: Could not save Product: ', productId);
      }

      console.log('---- HIT WEBHOOK ----');

    case 'CUSTOMERS_DATA_REQUEST':
    case 'CUSTOMERS_REDACT':
    case 'SHOP_REDACT':
    default:
      throw new Response('Unhandled webhook topic', { status: 404 });
  }

  throw new Response();
};
