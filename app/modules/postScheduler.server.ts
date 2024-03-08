import moment from "moment";
import { publishMedia } from "~/controllers/instagram.server";
import { getScheduledItemsByDate, removeScheduledItemFromQueue } from "~/controllers/post_schedule.server";
const schedule = require('node-schedule');

const postScheduler = {
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

export default postScheduler;