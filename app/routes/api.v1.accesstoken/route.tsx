import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { LoaderFunction } from '@remix-run/server-runtime';
import { shopSettingsService } from '~/services/SettingsService.server';

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);

    return new Response(`TEST`, {
        status: 200,
        headers: {
            'Content-Type': 'text/html'
        }
    });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    try {
        const body = await request.json();
        console.log('Request body:', body.data, body.data.fbAccessToken);

        // shopSettingsService.upsertFacebookAccessToken(body.data.sessionId, body.data.fbAccessToken);
    } catch (error) {
        console.log('DAS HAT NICHT FUNKTIONIERT', error);
    }

    return new Response(`POST ROUTE HIT`, {
        status: 200,
        headers: {
            'Content-Type': 'text/html'
        }
    });
};
