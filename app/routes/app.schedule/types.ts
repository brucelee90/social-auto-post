export interface ScheduleAction {
    error: boolean,
    message: string,
    action: string,
    productId: string
}

export interface ScheduleUtils {
    scheduleJobFunc : (productId: string,
        scheduledPostDateTime: string,
        postImageUrl: string,
        postDescription: string) => ScheduleAction,
    cancelJobFunc : (productId: string) => ScheduleAction
}