import { LoaderFunctionArgs } from '@remix-run/server-runtime';
import postScheduler from '~/modules/postScheduler.server';

export async function loader({ params }: LoaderFunctionArgs) {
    // const report = await getReport(params.id);
    // const pdf = await generateRepoærtPDF(report);

    postScheduler.runScheduledPostsByDate(new Date());
    let message = 'SCHEDULE CALLED WITHOUT ERROR';

    return new Response(`-- HIT SCHEDULE ROUTE ${message}--`, {
        status: 200,
        headers: {
            'Content-Type': 'text/html'
        }
    });
}
