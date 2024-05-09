import { PromiseType } from "@prisma/client/extension";
import { post } from "axios";
import { connect } from "http2";

interface PostScheduleQueue {

    productId: bigint;
    dateScheduled: Date;
    postImgUrl: string;
    postDescription: string;
}

interface postScheduleQueueService {
    addToPostScheduleQueue: (productId: string, dateScheduled: string, postImgUrl: string[], postDescription: string, sessionId: string, scheduleStatus: string) => Promise<{ productId: bigint; dateScheduled: Date; postImgUrl: string; postDescription: string; }>,
    getScheduledItemsByDate: (date: Date) => Promise<{ productId: bigint; dateScheduled: Date; postImgUrl: string; postDescription: string; shopName: string }[]>,
    removeScheduledItemFromQueue: (productId: string) => Promise<void>,
    getUnremovedItems: () => Promise<PostScheduleQueue[]>,
    getScheduledItem: (productId: string) => Promise<PostScheduleQueue>,
    getAllScheduledItems: () => Promise<PostScheduleQueue[]>
}

const postScheduleQueueService = {} as postScheduleQueueService

postScheduleQueueService.addToPostScheduleQueue = async function addToPostScheduleQueue(productId: string, dateScheduled: string, postImgUrl: string[], postDescription: string, sessionId: string, scheduleStatus: string) {

    let postImgUrlStr = postImgUrl.join(";")

    return await prisma.postScheduleQueue.upsert({
        where: { productId: BigInt(productId) },
        update: {
            postImgUrl: postImgUrlStr,
            productId: BigInt(productId),
            dateScheduled: dateScheduled,
            postDescription: postDescription
        },
        create: {
            productId: BigInt(productId),
            dateScheduled: dateScheduled,
            postImgUrl: postImgUrlStr,
            postDescription: postDescription,
            shopName: sessionId,
            Session: {
                connect: {
                    id: sessionId,
                }
            },
            scheduleStatus: scheduleStatus
        }
    });




}

postScheduleQueueService.getScheduledItemsByDate = async function getScheduledItemsByDate(date: Date) {

    let scheduleQueue = await prisma.postScheduleQueue.findMany({
        where: {
            dateScheduled: { gte: date }
        },

    });
    return scheduleQueue
}

postScheduleQueueService.getUnremovedItems = async () => {
    let unremovedItems = await prisma.postScheduleQueue.findMany({
        where: {
            dateScheduled: { lt: new Date() }
        }
    })

    return unremovedItems
}

postScheduleQueueService.removeScheduledItemFromQueue = async function removeScheduledItemFromQueue(productId: string) {
    try {

        await prisma.postScheduleQueue.delete({
            where: { productId: BigInt(productId) }
        })
    } catch (error) {
        console.log(`${productId} could not be deleted`);

    }
}

postScheduleQueueService.getScheduledItem = async function (productId: string) {
    return await prisma.postScheduleQueue.findFirstOrThrow({
        where: {
            productId: BigInt(productId)
        }
    })
}

postScheduleQueueService.getAllScheduledItems = async () => {
    return await prisma.postScheduleQueue.findMany()
}

export default postScheduleQueueService