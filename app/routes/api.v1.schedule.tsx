import { LoaderFunction } from '@remix-run/node';
import { LoaderFunctionArgs } from '@remix-run/server-runtime';
import postScheduler from '~/modules/postScheduler.server';

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const scheduleAction = url.searchParams.get('schedule_action');
    let message: string;

    try {
        switch (scheduleAction) {
            case 'cancel':
                postScheduler.cancelScheduledPost();
                break;

            default:
                postScheduler.runScheduledPostsByDate(new Date());
                break;
        }

        message = 'NO ERROR';
    } catch (error) {
        message = 'AN ERROR OCCURED';
    }

    return new Response(
        `-- HIT SCHEDULE ROUTE with scheduleAction: ${scheduleAction}; ${message} --`,
        {
            status: 200,
            headers: {
                'Content-Type': 'text/html'
            }
        }
    );
};
