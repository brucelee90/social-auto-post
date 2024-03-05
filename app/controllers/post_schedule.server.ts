// export async function addToPostScheduleQueue(productId: number, dateScheduled: string) {
//     return prisma.postScheduleQueue.create({
//         data: {
//             productId: productId,
//             dateScheduled: dateScheduled
//         }
//     })
// }
export async function addToPostScheduleQueue(productId: number, dateScheduled: string) {
    return prisma.postScheduleQueue.upsert({
        where: { productId: productId },
        update: {
            productId: productId,
            dateScheduled: dateScheduled
        },
        create: {
            productId: productId,
            dateScheduled: dateScheduled
        }
    })
}

export async function getScheduledItemsByDate(date: Date) {

    let scheduleQueue = await prisma.postScheduleQueue.findMany({
        where: {
            dateScheduled: { gte: date }
        },

    });
    return scheduleQueue

}

export async function removeScheduledItemFromQueue(productId: bigint) {
    return await prisma.postScheduleQueue.delete({
        where: { productId: productId }
    })
}