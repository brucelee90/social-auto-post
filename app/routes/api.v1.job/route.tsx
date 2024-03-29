import { LoaderFunction } from '@remix-run/node';
import { ActionFunctionArgs } from '@remix-run/server-runtime';
import jobService from '~/services/jobService.server';
import { JobAction } from '../global_utils/types';

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const jobAction = url.searchParams.get('job_action');
    let jobId = url.searchParams.get('job_id') as string;
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
                jobService.getAllJobs();
                responseMessage = 'All job done';
                break;

            case JobAction.schedule:
                if (jobId) {
                    jobService.scheduleJob(jobId);
                } else {
                    throw new Error('No job ID provided');
                }

                responseMessage = 'SCHEDULED JOB';
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

export async function action(req: ActionFunctionArgs) {
    return { req };
}
