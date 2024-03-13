import moment from "moment";
import instagramApiService from "~/services/instagramApiService.server";
import postScheduleQueueService from "~/services/postScheduleQueueService.server";
import { Agenda, Job } from "@hokify/agenda";
import email from "./lib/jobs/email";
const scheduler = require('node-schedule');


interface JobService {
    start: () => void
    getAllJobs: () => void
    runScheduledJobsByDate: (date: Date) => Promise<void>,
    cancelScheduledJob: (jobId: BigInt) => void
    jobs: [{}]
}

const jobService = {} as JobService


jobService.start = async () => {
    const agenda = new Agenda({ db: { address: process.env.MONGO_DB_CONNECTION_URL as string, collection: "agendaJobs" } });

    jobService.runScheduledJobsByDate(new Date())

    let unremovedItems = await postScheduleQueueService.getUnremovedItems()
    console.log("unremovedItems:", unremovedItems);
    unremovedItems.map((job) => {
        jobService.cancelScheduledJob(job.productId)
    })


    async function graceful() {
        await agenda.stop();
        process.exit(0);
    }

    process.on('SIGTERM', graceful);
    process.on('SIGINT', graceful);

}

jobService.getAllJobs = async () => {

    const agenda = new Agenda({
        db: { address: process.env.MONGO_DB_CONNECTION_URL as string, collection: "agendaJobs" }, processEvery: "1 minute",
        maxConcurrency: 20,
    });

    agenda
        .on("ready", () => console.log("Agenda started!"))
        .on("error", () => console.log("Agenda connection error!"));

    agenda.on("ready", async () => {
        console.log(await agenda.db.getJobs({}));
    })


}

jobService.runScheduledJobsByDate = async function (date: Date) {
    try {

        const agenda = new Agenda({ db: { address: process.env.MONGO_DB_CONNECTION_URL as string } });
        let postQueue = await postScheduleQueueService.getScheduledItemsByDate(date)

        postQueue.map((el: any) => {
            console.log(el.productId + ' will be posted at:', el.dateScheduled);
            const publishDate = moment(el.dateScheduled).toISOString();

            agenda.define(
                `${el.productId}`,
                async (job, done) => {

                    console.log("job", job);


                    instagramApiService.publishMedia(el.postImgUrl, el.postDescription)
                    postScheduleQueueService.removeScheduledItemFromQueue(el.productId)
                    console.log('Posted media at.', publishDate);
                    done()
                });


            (async function () {
                await agenda.start();
                await agenda.schedule(publishDate, `${el.productId}`, { to: 'info@l4webdesign.de' });
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

    const agenda = new Agenda({ db: { address: process.env.MONGO_DB_CONNECTION_URL as string } });

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

export default jobService;