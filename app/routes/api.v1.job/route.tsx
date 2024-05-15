import { LoaderFunction } from '@remix-run/node';
import { ActionFunctionArgs } from '@remix-run/server-runtime';
import jobService from '~/jobs/job.service.server';
import { JobAction } from '../global_utils/enum';

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const jobAction = url.searchParams.get('job_action');
    let jobId = url.searchParams.get('job_id') as string;
    let shopName = url.searchParams.get('shop_name') as string;
    let sessionId = url.searchParams.get('session_id') as string;
    let responseMessage: string;

    try {
        switch (jobAction) {
            case JobAction.start:
                jobService.start();
                responseMessage = 'started service successfully';
                break;

            case JobAction.cancel:
                if (jobId) {
                    jobService.cancelScheduledJob(jobId);
                    responseMessage = 'cancelled Job succesfully';
                } else {
                    responseMessage = 'please provide jobId';
                    throw new Error('No job ID provided');
                }
                break;

            case JobAction.get:
                let allJobs = await jobService.getAllfinishedJobs(sessionId);
                return allJobs;

                break;

            case JobAction.schedule:
                if (jobId) {
                    jobService.scheduleJob(jobId, shopName);
                } else {
                    throw new Error('No job ID provided');
                }

                responseMessage = 'SCHEDULED JOB';
                break;

            default:
                // jobService.runScheduledJobsByDate(new Date());
                responseMessage = 'No action';
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

export async function action(req: ActionFunctionArgs) {
    return { req };
}
