export enum Action {
    post = "post",
    schedule = "schedule",
    cancel = "cancel",
    error = "error",
}

export enum JobAction {
    schedule = 'schedule_job',
    cancel = 'cancel_job',
    get = 'get_jobs',
    start = 'start_job_service'
}

export enum PostForm {
    imgUrl = "img_url",
    description = "post_description",
    productId = "product_id",
    scheduledDate = "scheduled_date",
    scheduledTime = "scheduled_time",
}

export enum PublishType {
    publishStory = "publish_story",
    publishMedia = "publish_media"
}