export async function getMediaQueue(shopId: string) {
    return await prisma.mediaQueue.findMany({where: {shopId}})
}

export async function deleteMediaQueueItem(productId: string) {

    return await prisma.mediaQueue.delete({
        where: {
            productId: productId
        }
      })
      
}