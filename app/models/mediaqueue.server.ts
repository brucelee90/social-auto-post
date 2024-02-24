export async function getMediaQueue(shopId: string) {
  return await prisma.mediaQueue.findMany({ where: { shopId } });
}

export async function deleteMediaQueueItem(productId: number) {
  return await prisma.mediaQueue.delete({
    where: {
      productId: productId
    }
  });
}

export async function createMediaQueueItem(productId: number, shopId: string) {

  const createdProductId = await prisma.mediaQueue.create({
    data: {
      productId: productId,
      shopId: shopId
    }
  })

  console.log('createdProductId', createdProductId);

  return createdProductId;

}