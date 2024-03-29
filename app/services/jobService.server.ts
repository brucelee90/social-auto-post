import moment from "moment";
import instagramApiService from "~/services/instagramApiService.server";
import postScheduleQueueService from "~/services/postScheduleQueueService.server";
import { Agenda } from "@hokify/agenda";

const scheduler = require('node-schedule');


interface JobService {
    start: () => void
    getAllJobs: () => void
    runScheduledJobsByDate: (date: Date) => Promise<void>,
    scheduleJob: (jobId: string) => Promise<void>,
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
                console.log('hey', job.attrs.nextRunAt, new Date());

                agenda.define(
                    `${job.attrs.name}_rescheduled`,
                    async (job, done) => {
                        publishCarouselOrSingleMedia(job.attrs.data.imgUrl, job.attrs.data.description)
                        console.log('Posted media at.', job.attrs.lastRunAt);
                        done()
                    });
                (async function () {
                    await agenda.start();
                    await agenda.schedule(moment(job.attrs?.nextRunAt).toISOString(), `${job.attrs.name}_rescheduled`, { imgUrl: 'https://cdn.shopify.com/s/files/1/0585/4239/1487/products/air-jordan-1-mid-paint-drip-gs-1-1000.png?v=1631324039', description: "Scheduled Element" });
                })();
            } else if ((job.attrs.nextRunAt as Date) <= new Date()) {
                agenda.define(
                    `${job.attrs.name}_rescheduled`,
                    async (job, done) => {
                        publishCarouselOrSingleMedia(job.attrs.data.imgUrl, job.attrs.data.description)
                        console.log('Posted media at.', job.attrs.lastRunAt);
                        done()
                    });

                (async function () {
                    await agenda.start();
                    await agenda.schedule("10 second", `${job.attrs.name}_rescheduled`, { imgUrl: 'https://cdn.shopify.com/s/files/1/0585/4239/1487/products/air-jordan-1-mid-paint-drip-gs-1-1000.png?v=1631324039', description: "Scheduled Element" });
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

        postQueue.map((el: any) => {
            console.log(el.productId + ' will be posted at:', el.dateScheduled);
            const publishDate = moment(el.dateScheduled).toISOString();

            agenda.define(
                `${el.productId}`,
                async (job, done) => {

                    publishCarouselOrSingleMedia(el.postImgUrl, el.postDescription)
                    postScheduleQueueService.removeScheduledItemFromQueue(el.productId)
                    console.log('Posted media at.', publishDate);
                    done()
                });


            (async function () {
                await agenda.start();
                await agenda.schedule(publishDate, `${el.productId}`, { imgUrl: `${el.postImgUrl}`, description: `${el.postDescription}` });
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
        console.log(error);
        throw new Error(error as string)
    }
}

jobService.scheduleJob = async (jobId) => {
    let scheduleItem = await postScheduleQueueService.getScheduledItem(jobId)

    agenda.define(
        `${jobId}`,
        async (job, done) => {

            publishCarouselOrSingleMedia(scheduleItem.postImgUrl, scheduleItem.postDescription)
            postScheduleQueueService.removeScheduledItemFromQueue(scheduleItem.productId.toString())
            console.log('Posted media at.', scheduleItem.dateScheduled);
            done()
        });

    (async function () {
        await agenda.start();
        await agenda.schedule(scheduleItem.dateScheduled, `${scheduleItem.productId}`, { imgUrl: `${scheduleItem.postImgUrl}`, description: `${scheduleItem.postDescription}` });
    })();
}

function publishCarouselOrSingleMedia(imgUrl: string, postDescription: string) {
    let postImgUrlArray = imgUrl.split(";")
    let postCarousel = postImgUrlArray.length > 1 ? true : false
    console.log('postImgUrlArray', postImgUrlArray);
    if (postCarousel) {
        instagramApiService.publishCarousel(postImgUrlArray, postDescription)
    } else {
        instagramApiService.publishMedia(imgUrl, postDescription)
    }
}

export default jobService;