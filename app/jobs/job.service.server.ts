import moment from "moment";
import instagramApiService from "~/instagram/instagram.service.server";
import postScheduleQueueService, { ScheduledQueueService } from "~/jobs/schedulequeue.service.server";
import { Agenda, Job } from "@hokify/agenda";
import { PostScheduleQueue } from "@prisma/client";
import { InstagramPostDetails } from "~/routes/global_utils/types";
import { json } from "@remix-run/react";

const scheduler = require('node-schedule');


interface JobService {
    start: () => void
    getAllfinishedJobs: () => Promise<any>
    runScheduledJobsByDate: (date: Date) => Promise<void>,
    scheduleJob: (jobId: string, shopName: string) => Promise<void>,
    cancelScheduledJob: (jobId: string) => void
    jobs: [{}]
}

const agenda = new Agenda({
    db: { address: process.env.MONGO_DB_CONNECTION_URL as string, collection: "agendaJobs" }
});

const jobService = {

    start: async () => {
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
                            publishMedia(job.attrs.data.imgUrl, job.attrs.data.postDescription, job.attrs.name, job.attrs.data.shop)
                            console.log('Posted media at.', job.attrs.lastRunAt);
                            done()
                        });
                    (async function () {
                        postScheduleQueueService.removeScheduledItemFromQueue(job.attrs.name)
                        await agenda.start();
                        await agenda.schedule(moment(job.attrs?.nextRunAt).toISOString(), `${job.attrs.name}_rescheduled`, { imgUrl: job.attrs.data.imgUrl, postDescription: job.attrs.data.postDescription, postTitle: job.attrs.data.postTitle, shop: job.attrs.data.shop });
                    })();
                } else if ((job.attrs.nextRunAt as Date) <= new Date()) {
                    agenda.define(
                        `${job.attrs.name}_rescheduled`,
                        async (job, done) => {
                            publishMedia(job.attrs.data.imgUrl, job.attrs.data.postDescription, job.attrs.name, job.attrs.data.shop)
                            console.log('Posted media at.', job.attrs.lastRunAt);
                            done()
                        });

                    agenda.cancel({ name: `${job.attrs.name}` });

                    (async function () {

                        postScheduleQueueService.removeScheduledItemFromQueue(job.attrs.name)
                        await agenda.start();
                        await agenda.schedule("10 second", `${job.attrs.name}_rescheduled`, { imgUrl: job.attrs.data.imgUrl, postDescription: job.attrs.data.postDescription, postTitle: job.attrs.data.postTitle, shop: job.attrs.data.shop });
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

    },

    getAllfinishedJobs: async (shopName: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let finishedJobs = await agenda.jobs({ lastRunAt: { $lt: today }, "data.shop": `${shopName}` })

        const simplifiedJobs = finishedJobs.map(job => ({
            id: job.attrs._id,
            title: (job.attrs.data as InstagramPostDetails).postTitle,
            name: job.attrs.name,
            postImgUrl: (job.attrs.data as InstagramPostDetails).postImgUrl,
            postDescription: (job.attrs.data as InstagramPostDetails).postDescription,
            nextRunAt: job.attrs.nextRunAt,
            lastFinishedAt: job.attrs.lastFinishedAt,
            failedAt: job.attrs.failedAt,

        }));

        return simplifiedJobs;
    },


    runScheduledJobsByDate: async function (date: Date) {
        try {

            let postQueue = await postScheduleQueueService.getScheduledItemsByDate(date)

            postQueue.map(el => {
                console.log(el.productId + ' will be posted at:', el.dateScheduled);
                const publishDate = moment(el.dateScheduled).toISOString();

                agenda.define(
                    `${el.productId}`,
                    async (job, done) => {

                        publishMedia(el.postImgUrl, el.postDescription, String(el.productId), el.shopName)
                        postScheduleQueueService.removeScheduledItemFromQueue(String(el.productId))
                        console.log('Posted media at.', publishDate);
                        done()
                    });


                (async function () {
                    await agenda.start();
                    await agenda.schedule(publishDate, `${el.productId}`, { imgUrl: `${el.postImgUrl}`, postDescription: `${el.postDescription}`, shop: "l4-dev-shop.myshopify.com" });
                })();
            })

        } catch (error) {
            console.log(error);
            throw new Error()
        }

    },

    cancelScheduledJob: async (jobId: string) => {

        try {
            agenda.on("ready", async () => {
                const numRemoved = await agenda.cancel({ name: `${jobId}` });
                console.log('numRemoved', numRemoved);
            })

        } catch (error) {
            console.log("error while canceling job:", jobId, error);
        }
    },

    scheduleJob: async (jobId: string, shopName: string) => {


        let scheduleItem = await new ScheduledQueueService("instagram").getScheduledItem(jobId)

        let scheduleItemPostDetailsJSON: InstagramPostDetails = JSON.parse(
            JSON.stringify(
                scheduleItem.postDetails
            )
        )

        agenda.define(
            `${jobId}`,
            async (job, done) => {



                publishMedia(scheduleItemPostDetailsJSON.postImgUrl, scheduleItemPostDetailsJSON.postDescription, jobId, shopName)
                postScheduleQueueService.removeScheduledItemFromQueue(scheduleItem.productId.toString())
                console.log('Posted media at.', scheduleItem.dateScheduled);
                done()
            });

        (async function () {
            await agenda.start();
            await agenda.schedule(scheduleItem.dateScheduled, `${scheduleItem.productId}`, { imgUrl: `${scheduleItemPostDetailsJSON.postImgUrl}`, postDescription: `${scheduleItemPostDetailsJSON.postDescription}`, postTitle: `${scheduleItemPostDetailsJSON.postTitle}`, shop: shopName });
        })();
    }
}

function publishMedia(imgUrl: string, postDescription: string, productId: string, shopName: string) {
    let postImgUrlArray = imgUrl.split(";")
    let prodId = "gid://shopify/Product/" + productId

    instagramApiService.publishMedia(postImgUrlArray, postDescription, prodId, shopName)
}

export default jobService;


export namespace JobService {

}