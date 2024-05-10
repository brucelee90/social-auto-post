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
    codeDiscount = "code_discount",
    placeholderName = "custom_placeholder_name",
    placeholderContent = "custom_placeholder_content",
}

export enum PublishType {
    publishStory = "publish_story",
    publishMedia = "publish_media"
}

export enum PlaceholderVariable {
    codeDiscount = "#DISCOUNT#"
}

export enum PostStatus {
    draft = "draft",
    scheduled = "scheduled",
    posted = "posted"
}