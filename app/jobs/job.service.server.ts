import moment from "moment";
import instagramApiService from "~/instagram/instagram.service.server";
import postScheduleQueueService from "~/jobs/schedulequeue.service.server";
import { Agenda } from "@hokify/agenda";
import { PostScheduleQueue } from "@prisma/client";

const scheduler = require('node-schedule');


interface JobService {
    start: () => void
    getAllJobs: () => void
    runScheduledJobsByDate: (date: Date) => Promise<void>,
    scheduleJob: (jobId: string, shopName: string) => Promise<void>,
    cancelScheduledJob: (jobId: string) => void
    jobs: [{}]
}

const agenda = new Agenda({ db: { address: process.env.MONGO_DB_CONNECTION_URL as string, collection: "agendaJobs" } });

const jobService = {} as JobService

jobService.start = async () => {
    agenda.on("ready", async () => {
        // @ts-ignore
        // a queued job will stay queued forever by agenda js if it didn't run. If the server is stopped during the time a job should have run.
        let allQueuedJobs = await agenda.jobs({ lastRunAt: { $in: [null, false] } })

        allQueuedJobs.map((job: any) => {
            console.log('job.attrs.nextRunAt', job.attrs.nextRunAt, (job.attrs.nextRunAt as Date) > new Date(), (job.attrs.nextRunAt as Date) < new Date());

            // finish job now if job should have been done by now
            if ((job.attrs.nextRunAt as Date) > new Date()) {
                console.log('finish job now if job should have been done by now', job.attrs.nextRunAt, new Date());

                agenda.define(
                    `${job.attrs.name}_rescheduled`,
                    async (job, done) => {
                        publishMedia(job.attrs.data.imgUrl, job.attrs.data.description, job.attrs.name, job.attrs.data.shop)
                        console.log('Posted media at.', job.attrs.lastRunAt);
                        done()
                    });
                (async function () {
                    postScheduleQueueService.removeScheduledItemFromQueue(job.attrs.name)
                    await agenda.start();
                    await agenda.schedule(moment(job.attrs?.nextRunAt).toISOString(), `${job.attrs.name}_rescheduled`, { imgUrl: job.attrs.data.imgUrl, description: job.attrs.data.description, shop: job.attrs.data.shop });
                })();
            } else if ((job.attrs.nextRunAt as Date) <= new Date()) {
                agenda.define(
                    `${job.attrs.name}_rescheduled`,
                    async (job, done) => {
                        publishMedia(job.attrs.data.imgUrl, job.attrs.data.description, job.attrs.name, job.attrs.data.shop)
                        console.log('Posted media at.', job.attrs.lastRunAt);
                        done()
                    });

                agenda.cancel({ name: `${job.attrs.name}` });

                (async function () {

                    postScheduleQueueService.removeScheduledItemFromQueue(job.attrs.name)
                    await agenda.start();
                    await agenda.schedule("10 second", `${job.attrs.name}_rescheduled`, { imgUrl: job.attrs.data.imgUrl, description: job.attrs.data.description, shop: job.attrs.data.shop });
                })();
            }

            // reschedule job if job is in the future
            jobService.cancelScheduledJob(job.attrs.name)

        })
    })

    async function graceful() {
        await agenda.stop();
        process.exit(0);
    }

    process.on('SIGTERM', graceful);
    process.on('SIGINT', graceful);

}

jobService.getAllJobs = async () => {

    agenda
        .on("ready", () => console.log("Agenda started!"))
        .on("error", () => console.log("Agenda connection error!"));

    agenda.on("ready", async () => {
        console.log(await agenda.db.getJobs({}));
    })

}

jobService.runScheduledJobsByDate = async function (date: Date) {
    try {

        let postQueue = await postScheduleQueueService.getScheduledItemsByDate(date)

        postQueue.map((el: PostScheduleQueue) => {
            console.log(el.productId + ' will be posted at:', el.dateScheduled);
            const publishDate = moment(el.dateScheduled).toISOString();

            agenda.define(
                `${el.productId}`,
                async (job, done) => {

                    publishMedia(el.postImgUrl, el.postDescription, String(el.productId), "l4-dev-shop.myshopify.com")
                    postScheduleQueueService.removeScheduledItemFromQueue(String(el.productId))
                    console.log('Posted media at.', publishDate);
                    done()
                });


            (async function () {
                await agenda.start();
                await agenda.schedule(publishDate, `${el.productId}`, { imgUrl: `${el.postImgUrl}`, description: `${el.postDescription}`, shop: "l4-dev-shop.myshopify.com" });
            })();
        })

    } catch (error) {
        console.log(error);
        throw new Error()
    }

    /*
        let postQueue = await postScheduleQueueService.getScheduledItemsByDate(date)
    
        postQueue.map((el: any) => {
            console.log(el.productId + ' will be posted at:', el.dateScheduled);
            const publishDate = moment(el.dateScheduled).toISOString();
    
    
            let s = scheduler.scheduleJob('job_name', publishDate, function () {
                instagramApiService.publishMedia(el.postImgUrl, el.postDescription)
                postScheduleQueueService.removeScheduledItemFromQueue(el.productId)
                console.log('Posted media at.', publishDate);
    
                // When scheduled Function is run, it will only call this callback function.
                // So job has to be removed from jobService.jobs right here in order to keep track of all jobs
    
            });
    
        });
    
        console.log('----------- scheduler.scheduledJobs ---------', scheduler.scheduledJobs);
        jobService.jobs.push(scheduler.scheduledJobs)
    
        console.log('jobService.jobs from function', jobService.jobs);
    */

}

jobService.cancelScheduledJob = async (jobId) => {

    try {
        agenda.on("ready", async () => {
            const numRemoved = await agenda.cancel({ name: `${jobId}` });
            console.log('numRemoved', numRemoved);
        })

    } catch (error) {
        console.log("error while canceling job:", jobId, error);
    }
}

jobService.scheduleJob = async (jobId, shopName) => {

    let scheduleItem = await postScheduleQueueService.getScheduledItem(jobId)

    agenda.define(
        `${jobId}`,
        async (job, done) => {

            publishMedia(scheduleItem.postImgUrl, scheduleItem.postDescription, jobId, shopName)
            postScheduleQueueService.removeScheduledItemFromQueue(scheduleItem.productId.toString())
            console.log('Posted media at.', scheduleItem.dateScheduled);
            done()
        });

    (async function () {
        await agenda.start();
        await agenda.schedule(scheduleItem.dateScheduled, `${scheduleItem.productId}`, { imgUrl: `${scheduleItem.postImgUrl}`, description: `${scheduleItem.postDescription}`, shop: shopName });
    })();
}

function publishMedia(imgUrl: string, postDescription: string, productId: string, shopName: string) {
    let postImgUrlArray = imgUrl.split(";")
    let prodId = "gid://shopify/Product/" + productId

    instagramApiService.publishMedia(postImgUrlArray, postDescription, prodId, shopName)
}

export default jobService;