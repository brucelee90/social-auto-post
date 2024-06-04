import moment from "moment";
import messageBrokerService from "~/jobs/messagingbroker.service.server";
import postScheduleQueueService, { PlatformType, ScheduledQueueService, scheduledQueueService } from "~/jobs/schedulequeue.service.server";
import { Action as MqAction, PostStatus } from '../global_utils/enum'

type MqMessageKeys = "action" | "productId" | "scheduledTime" | "sessionId";

export interface ActionMessage { error: boolean, message: string, action: string, productId: string }

export interface ScheduleAction {
    error: boolean,
    message: string,
    action: string,
    productId: string
}

export interface ScheduleUtils {
    scheduleJobFunc: (productId: string,
        scheduledPostDateTime: string,
        productTitle: string,
        postImageUrl: string[],
        postDescription: string,
        sessionId: string,
        scheduleStatus: string,
        platform: PlatformType,
    ) => ScheduleAction,
    cancelJobFunc: (productId: string) => ScheduleAction,
    errorMessage: (productId: string) => ScheduleAction
}

const createMqMessageJson = (action: string, productId: string, scheduledTime: string, sessionId: string): string => {
    const obj: Record<MqMessageKeys, string> = {
        action: action,
        productId: productId,
        scheduledTime: scheduledTime,
        sessionId: sessionId
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

export const scheduleUtils = {

    scheduleJobFunc: (
        productId: string,
        scheduledPostDateTime: string,
        productTitle: string,
        postImageUrl: string[],
        postDescription: string,
        sessionId: string,
        scheduleStatus: PostStatus,
        platform: PlatformType,
        message: any = null
    ) => {


        if (scheduleStatus === PostStatus.scheduled) {
            let mqScheduleMessageJSON = createMqMessageJson(MqAction.schedule, productId, scheduledPostDateTime, sessionId)
            messageBrokerService.addItemToQueue(mqScheduleMessageJSON);
            message = `Set to be scheduled on ${moment(scheduledPostDateTime).format('YYYY MM DD')} at ${moment(scheduledPostDateTime).format('hh:mm')}`
            console.log('post Product', productId, 'on', scheduledPostDateTime);
        } else if (scheduleStatus === PostStatus.draft) {
            message = `successfully saved as draft`
        }

        new ScheduledQueueService(platform).addToPostScheduleQueue(
            productId,
            scheduledPostDateTime,
            productTitle,
            postImageUrl,
            postDescription,
            sessionId,
            scheduleStatus
        );

        let actionMessage = createActionMessage(false, message, MqAction.schedule, productId)

        return actionMessage
    },

    cancelJobFunc: (productId: string) => {

        try {
            let mqCancelMessageJSON = createMqMessageJson(MqAction.schedule, productId, "", "")
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

    errorMessage: (productId: string, message: any = null) => {
        if (message == null) {
            message = "This action did not work. please try again"
        }
        let actionMessage = createActionMessage(true, message, MqAction.error, productId)
        return actionMessage
    }
}