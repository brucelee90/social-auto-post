interface postScheduleQueueService {
    addToPostScheduleQueue: (productId: number, dateScheduled: string, postImgUrl: string, postDescriptiop: string) => Promise<{ productId: bigint; dateScheduled: Date; postImgUrl: string; postDescription: string; }>,
    getScheduledItemsByDate: (date: Date) => Promise<{ productId: bigint; dateScheduled: Date; postImgUrl: string; postDescription: string; }[]>,
    removeScheduledItemFromQueue: (productId: number) => Promise<void>,
}

const postScheduleQueueService = {} as postScheduleQueueService

postScheduleQueueService.addToPostScheduleQueue = async function addToPostScheduleQueue(productId: number, dateScheduled: string, postImgUrl: string, postDescriptiop: string) {
    return prisma.postScheduleQueue.upsert({
        where: { productId: productId },
        update: {
            productId: productId,
            dateScheduled: dateScheduled
        },
        create: {
            productId: productId,
            dateScheduled: dateScheduled,
            postImgUrl: postImgUrl,
            postDescription: postDescriptiop
        }
    })
}

postScheduleQueueService.getScheduledItemsByDate = async function getScheduledItemsByDate(date: Date) {

    let scheduleQueue = await prisma.postScheduleQueue.findMany({
        where: {
            dateScheduled: { gte: date }
        },

    });
    return scheduleQueue

}

postScheduleQueueService.removeScheduledItemFromQueue = async function removeScheduledItemFromQueue(productId: number) {
    try {

        await prisma.postScheduleQueue.delete({
            where: { productId: productId }
        })
    } catch (error) {
        console.log(`${productId} could not be deleted`);

    }
}

export default postScheduleQueueService