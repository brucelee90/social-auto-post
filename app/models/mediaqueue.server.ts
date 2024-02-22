export async function getMediaQueue(shopId: string) {
    return await prisma.mediaQueue.findMany({where: {shopId}})
}