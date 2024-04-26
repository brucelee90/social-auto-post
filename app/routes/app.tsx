import type { HeadersFunction, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, Outlet, useLoaderData, useRouteError } from '@remix-run/react';
import polarisStyles from '@shopify/polaris/build/esm/styles.css';
import { boundary } from '@shopify/shopify-app-remix/server';
import { AppProvider } from '@shopify/shopify-app-remix/react';
import { authenticate } from '../shopify.server';
import { log } from 'console';
import { scheduler } from 'timers/promises';

export const links = () => [{ rel: 'stylesheet', href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
    await authenticate.admin(request);

    return json({ apiKey: process.env.SHOPIFY_API_KEY || '' });
};

export default function App() {
    const { apiKey } = useLoaderData<typeof loader>();

    return (
        <AppProvider isEmbeddedApp apiKey={apiKey}>
            <ui-nav-menu>
                <Link to="/app" rel="home">
                    Home
                </Link>
                <Link to="/app/additional">Additional page</Link>
                <Link to="/app/dashboard">Dashboard</Link>
                <Link to="/app/postcenter">Post Center</Link>
                <Link to="/app/mediaqueue">Media Queue</Link>
                <Link to="/app/schedule">Schedule</Link>
                <Link to="/app/campaigns">Campaigns</Link>
                <Link to="/app/settings">Settings</Link>
            </ui-nav-menu>
            <Outlet />
        </AppProvider>
    );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
    return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
    return boundary.headers(headersArgs);
};
