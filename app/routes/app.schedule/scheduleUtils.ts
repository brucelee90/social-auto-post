import moment from "moment";
import messageBrokerService from "~/jobs/messagingbroker.service.server";
import postScheduleQueueService from "~/jobs/schedulequeue.service.server";
import { Action as MqAction } from '../global_utils/enum'

type MqMessageKeys = "action" | "productId" | "scheduledTime";

interface ActionMessage { error: boolean, message: string, action: string, productId: string }

export interface ScheduleAction {
    error: boolean,
    message: string,
    action: string,
    productId: string
}

export interface ScheduleUtils {
    scheduleJobFunc: (productId: string,
        scheduledPostDateTime: string,
        postImageUrl: string[],
        postDescription: string) => ScheduleAction,
    cancelJobFunc: (productId: string) => ScheduleAction,
    errorMessage: (productId: string) => ScheduleAction
}

const createMqMessageJson = (action: string, productId: string, scheduledTime: string): string => {
    const obj: Record<MqMessageKeys, string> = {
        action: action,
        productId: productId,
        scheduledTime: scheduledTime
    }
    return JSON.stringify(obj)
}

const createActionMessage = (error: boolean, message: string, action: string, productId: string): ActionMessage => {

    const obj: ActionMessage = {
        error: error,
        message: message,
        action: action,
        productId: productId
    }

    return obj
}

export const scheduleUtils: ScheduleUtils = {

    scheduleJobFunc: (
        productId: string,
        scheduledPostDateTime: string,
        postImageUrl: string[],
        postDescription: string

    ) => {

        let mqScheduleMessageJSON = createMqMessageJson(MqAction.schedule, productId, scheduledPostDateTime)
        messageBrokerService.addItemToQueue(mqScheduleMessageJSON);
        postScheduleQueueService.addToPostScheduleQueue(
            productId,
            scheduledPostDateTime,
            postImageUrl,
            postDescription,
        );

        console.log('post Product', productId, 'on', scheduledPostDateTime);

        let message = `Set to be scheduled on ${moment(scheduledPostDateTime).format('YYYY MM DD')} at ${moment(scheduledPostDateTime).format('hh:mm')}`
        let actionMessage = createActionMessage(false, message, MqAction.schedule, productId)

        return actionMessage
    },

    cancelJobFunc: (productId: string) => {

        try {
            let mqCancelMessageJSON = createMqMessageJson(MqAction.schedule, productId, "")
            let message = "Scheduled product was cancelled successfully"
            let actionMessage = createActionMessage(false, message, MqAction.cancel, productId)
            messageBrokerService.addItemToQueue(JSON.stringify(mqCancelMessageJSON));
            postScheduleQueueService.removeScheduledItemFromQueue(productId);

            return actionMessage
        } catch (error) {
            console.log(
                `${productId} could not be deleted from post ScheduleService. The current queue contains ${postScheduleQueueService.getScheduledItemsByDate(new Date())}`
            );

            return scheduleUtils.errorMessage(productId)
        }

    },

    errorMessage: (productId: string) => {
        let message = "This action did not work. please try again"
        let actionMessage = createActionMessage(true, message, MqAction.error, productId)
        return actionMessage
    }
}