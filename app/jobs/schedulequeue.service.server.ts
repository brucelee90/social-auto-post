import { PostStatus } from "~/routes/global_utils/enum";
import { object, string, AnyObjectSchema } from 'yup';



export const postDetailsSchema = object({
    postDescription: string().required(),
    postImgUrl: string().required()
});

export type PlatformType = 'instagram' | 'facebook' | 'twitter';

const schemas: Record<PlatformType, AnyObjectSchema> = {
    instagram: object({
        postDescription: string().required(),
        postImgUrl: string().required()
    }),
    facebook: object({
        postDescription: string().required(),
        postImgUrl: string().required()
    }),
    twitter: object({
        postDescription: string().required(),
        postImgUrl: string().required()
    })
};




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

    scheduleStatus = "scheduled"
    let postStatus
    if (scheduleStatus === PostStatus.draft) {
        postStatus = PostStatus.draft
    } else if (scheduleStatus === PostStatus.scheduled) {
        postStatus = PostStatus.scheduled
    } else if (scheduleStatus === PostStatus.posted) {
        postStatus = PostStatus.posted
    }

    const postDetails = {
        postDescription: postDescription,
        postImgUrl: postImgUrlStr
    }

    await postDetailsSchema.validate(postDetails)

    return await prisma.postScheduleQueue.upsert({
        where: { productId: BigInt(productId) },
        update: {
            postImgUrl: postImgUrlStr,
            productId: BigInt(productId),
            dateScheduled: dateScheduled,
            postDescription: postDescription,
            scheduleStatus: postStatus,
            postDetails: postDetails
        },
        create: {
            productId: BigInt(productId),
            dateScheduled: dateScheduled,
            postImgUrl: postImgUrlStr,
            postDescription: postDescription,
            shopName: sessionId,
            postDetails: postDetails,
            Session: {
                connect: {
                    id: sessionId,
                }
            },
            scheduleStatus: postStatus as PostStatus
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
    const scheduledItem = await prisma.postScheduleQueue.findFirstOrThrow({
        where: {
            productId: BigInt(productId),
            scheduleStatus: PostStatus.scheduled
        }
    })

    try {
        postDetailsSchema.validate(scheduledItem.postDetails)
    } catch (error) {
        console.log("Post Details JSON is not validated", scheduledItem.postDetails);
    }

    return scheduledItem
}

postScheduleQueueService.getAllScheduledItems = async () => {
    return await prisma.postScheduleQueue.findMany()
}

export default postScheduleQueueService


export namespace scheduledQueueService {



    export const getAllScheduledItems = async (sessionId: string) => {
        const scheduluedItems = await prisma.session.findUniqueOrThrow({
            where: {
                id: sessionId
            },
            include: {
                postScheduleQueue: true
            }
        })

        scheduluedItems.postScheduleQueue.map(async e => {
            try {
                await postDetailsSchema.validate(e.postDetails)
            } catch (error) {

                console.log("JSON NOT VALID");

            }
        })

        return scheduluedItems
    }
}

export class ScheduledQueueService {

    platform: PlatformType;
    validationSchema: AnyObjectSchema

    constructor(platform: PlatformType) {
        this.platform = platform;

        if (!schemas[platform]) {
            console.log(`Unbekannte Plattform: ${this.platform}`);
        }

        this.validationSchema = schemas[this.platform];
    }


    public async addToPostScheduleQueue(productId: string, dateScheduled: string, postImgUrl: string[], postDescription: string, sessionId: string, scheduleStatus: string) {

        let postImgUrlStr = postImgUrl.join(";")

        scheduleStatus = "scheduled"
        let postStatus
        if (scheduleStatus === PostStatus.draft) {
            postStatus = PostStatus.draft
        } else if (scheduleStatus === PostStatus.scheduled) {
            postStatus = PostStatus.scheduled
        } else if (scheduleStatus === PostStatus.posted) {
            postStatus = PostStatus.posted
        }

        const postDetails = {
            postDescription: postDescription,
            postImgUrl: postImgUrlStr
        }

        // await postDetailsSchema.validate(postDetails)
        await this.validationSchema.validate(postDetails)

        return await prisma.postScheduleQueue.upsert({
            where: { productId: BigInt(productId) },
            update: {
                postImgUrl: postImgUrlStr,
                productId: BigInt(productId),
                dateScheduled: dateScheduled,
                postDescription: postDescription,
                scheduleStatus: postStatus,
                postDetails: postDetails,
                platform: this.platform
            },
            create: {
                productId: BigInt(productId),
                dateScheduled: dateScheduled,
                postImgUrl: postImgUrlStr,
                postDescription: postDescription,
                shopName: sessionId,
                postDetails: postDetails,
                Session: {
                    connect: {
                        id: sessionId,
                    }
                },
                scheduleStatus: postStatus as PostStatus,
                platform: this.platform
            }
        });
    }

    public async getAllScheduledItems(sessionId: string) {
        const scheduluedItems = await prisma.session.findUniqueOrThrow({
            where: {
                id: sessionId
            },
            include: {
                postScheduleQueue: true
            }
        })

        scheduluedItems.postScheduleQueue.map(async e => {
            try {
                await this.validationSchema.validate(e.postDetails)
            } catch (error) {
                console.log("JSON NOT VALID");
            }
        })

        return scheduluedItems
    }

}