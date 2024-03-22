export enum Action {
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