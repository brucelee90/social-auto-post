import moment from "moment";
import instagramApiService from "~/services/instagramApiService.server";
import postScheduleQueueService from "~/services/postScheduleQueueService.server";
const schedule = require('node-schedule');

interface PostScheduler {
    runScheduledPostsByDate: (date: Date) => Promise<{ error: boolean; }>
}

const postScheduler = {} as PostScheduler

postScheduler.runScheduledPostsByDate = async function (date: Date) {
    try {
        let postQueue = await postScheduleQueueService.getScheduledItemsByDate(date)

        postQueue.map((el: any) => {
            console.log(el.productId + ' will be posted at:', el.dateScheduled);
            const publishDate = moment(el.dateScheduled).toISOString();
            schedule.scheduleJob(publishDate, function () {

                instagramApiService.publishMedia(el.postImgUrl, el.postDescription)
                postScheduleQueueService.removeScheduledItemFromQueue(el.productId)
                console.log('Posted media at.', publishDate);
            });
        });

        return { error: false };
    } catch (error) {
        return { error: true };
    }
}

/*
const postSchedulerr = {
    runScheduledPostsByDate: async function (date: Date) {
        try {
            let postQueue = await getScheduledItemsByDate(date);
            // console.log('postQueue', postQueue);

            postQueue.map((el: any) => {
                console.log(el.productId + ' will be posted at:', el.dateScheduled);
                const publishDate = moment(el.dateScheduled).toISOString();
                schedule.scheduleJob(publishDate, function () {
                    publishMedia(el.postImgUrl, el.postDescription);

                    removeScheduledItemFromQueue(el.productId);
                    console.log('Posted media at.', publishDate);
                });
            });

            return { error: false };
        } catch (error) {
            return { error: true };
        }
    }
}
*/

export default postScheduler;