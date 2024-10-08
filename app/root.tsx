import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import FacebookSDK from './components/FacebookSDK';
import type { LinksFunction } from '@remix-run/node';
import { cssBundleHref } from '@remix-run/css-bundle';
import 'bootstrap/dist/css/bootstrap.min.css';

export const links: LinksFunction = () => {
    return [...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : [])];
};

export default function App() {
    return (
        <html>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width,initial-scale=1" />
                <link rel="preconnect" href="https://cdn.shopify.com/" />
                <link
                    rel="stylesheet"
                    href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
                />
                <Meta />
                <Links />
            </head>
            <body>
                <Outlet />
                <ScrollRestoration />
                <LiveReload />
                <FacebookSDK />
                <Scripts />
            </body>
        </html>
    );
}
