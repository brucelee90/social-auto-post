import { LoaderFunction } from '@remix-run/node';
import jobService from '~/services/jobService.server';

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const jobAction = url.searchParams.get('job_action');
    let jobId = url.searchParams.get('job_id') as string;
    let responseMessage: string;

    try {
        switch (jobAction) {
            case 'start_service':
                jobService.start();
                responseMessage = 'started service successfully';
                break;

            case 'cancel_job':
                // jobService.getAllJobs();
                if (jobId) {
                    let jobIdToBeCancelled: BigInt = BigInt(jobId);
                    jobService.cancelScheduledJob(jobIdToBeCancelled);
                    // postScheduleQueueService.removeScheduledItemFromQueue(parseInt(jobId));
                    responseMessage = 'canceld Job succesfully';
                } else {
                    responseMessage = 'please provide jobId';
                }

                break;

            case 'get_jobs':
                // jobService.getAllJobs();
                jobService.getAllJobs();
                responseMessage = 'ALL JOBS';
                break;

            default:
                jobService.runScheduledJobsByDate(new Date());
                responseMessage = 'scheduled Jobs run successfully';
                break;
        }

        return new Response(`${responseMessage}`, {
            status: 200,
            headers: {
                'Content-Type': 'text/html'
            }
        });
    } catch (error) {
        console.log(error);
        responseMessage = 'AN ERROR OCCURED' + error;
        return new Response(
            `-- HIT SCHEDULE ROUTE with jobAction: ${jobAction}; ${responseMessage} --`,
            {
                status: 500,
                headers: {
                    'Content-Type': 'text/html'
                }
            }
        );
    }
};
