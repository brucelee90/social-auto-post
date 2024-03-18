import moment from "moment";
import messageBrokerService from "~/services/messagingBrokerService.server";
import postScheduleQueueService from "~/services/postScheduleQueueService.server";
import { ScheduleUtils } from "./types";

export const scheduleUtils = {} as ScheduleUtils

scheduleUtils.scheduleJobFunc = (
    productId: string,
    scheduledPostDateTime: string,
    postImageUrl: string,
    postDescription: string
) => {
    // REFACTOR THIS TO BETTER MAKE SURE THAT JSON ALWAYS HAS SAME STRUCTURE
    messageBrokerService.addItemToQueue(
        `{"action": "schedule", "productId": "${productId}", "scheduledTime": "${scheduledPostDateTime}"}`
    );

    postScheduleQueueService.addToPostScheduleQueue(
        productId,
        scheduledPostDateTime,
        postImageUrl,
        postDescription
    );

    console.log('post Product', productId, 'on', scheduledPostDateTime);

    return {
        error: false,
        message: `Set to be scheduled on ${moment(scheduledPostDateTime).format('YYYY MM DD')} at ${moment(scheduledPostDateTime).format('hh:mm')}`,
        action: 'schedule',
        productId: productId
    };
};

export const cancelJobFunc = (productId: string) => {
    // REFACTOR THIS TO BETTER MAKE SURE THAT JSON ALWAYS HAS SAME STRUCTURE
    messageBrokerService.addItemToQueue(
        `{"action": "cancel", "productId": "${productId}", "scheduledTime": ""}`
    );
    try {
        postScheduleQueueService.removeScheduledItemFromQueue(productId);
    } catch (error) {
        console.log(
            `${productId} could not be deleted from post ScheduleService. The current queue contains ${postScheduleQueueService.getScheduledItemsByDate(new Date())}`
        );
    }

    return {
        error: false,
        message: `Scheduled product was cancelled successfully`,
        action: 'cancel',
        productId: productId
    };
};