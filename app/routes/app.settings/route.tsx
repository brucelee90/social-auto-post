import { useState } from 'react';
import settingsService, { getSettings } from '../../services/SettingsService.server';
import { Form, json, useActionData, useFetcher, useLoaderData } from '@remix-run/react';
import { authenticate } from '~/shopify.server';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Text } from '@shopify/polaris';

interface ApiResponse {
    success: boolean;
    message: string;
}

function createApiResponse(success: boolean, message: string) {
    return { success, message } as ApiResponse;
}

export async function loader({ request }: LoaderFunctionArgs) {
    const { session } = await authenticate.admin(request);
    const { shop } = session;
    let shopSettings = null;
    try {
        shopSettings = await getSettings(shop);
    } catch (error) {
        console.log('error while getting settings');
    }

    return json({
        customPlaceholder: shopSettings?.customPlaceholder,
        shopSettings: shopSettings
    });
}

export async function action({ request }: ActionFunctionArgs) {
    const { session } = await authenticate.admin(request);
    const { shop } = session;

    const formData = await request.formData();
    let customPlaceholderName = formData.get('custom_placeholder_name') as string;
    let customPlaceholderContent = formData.get('custom_placeholder_content') as string;

    try {
        await settingsService.upsertCustomPlaceholder(
            shop,
            customPlaceholderName,
            customPlaceholderContent
        );
        return createApiResponse(true, 'Settings saved successfully.');
    } catch (error) {
        console.log('error while saving setting');
        return createApiResponse(false, 'Failed to save settings.');
    }
}

interface Props {}

export default function Settings(props: Props) {
    const {} = props;
    const { customPlaceholder } = useLoaderData<typeof loader>();

    return (
        <div>
            <Text as="h1" variant="headingLg">
                Settings
            </Text>

            {customPlaceholder?.map((customPlaceholderElement, key) => (
                <div
                    key={key}
                    style={{ display: 'flex', borderBottom: '1px solid black', paddingTop: '1rem' }}
                >
                    <PlaceholderForm placeholder={customPlaceholderElement} />
                </div>
            ))}
            <Form method="post" style={{ paddingTop: '1rem' }}>
                <div>
                    <label htmlFor="custom_placeholder_name">Placeholder name</label>
                    <input type="text" name="custom_placeholder_name" defaultValue="" />
                </div>
                <div>
                    <label htmlFor="custom_placeholder_content">Placeholder value</label>
                    <input type="text" name="custom_placeholder_content" defaultValue="" />
                </div>
                <button>Add new Text block</button>
            </Form>
        </div>
    );
}

interface Props {
    placeholder: {
        customPlaceholderId: string;
        customPlaceholderContent: string;
    };
}

function PlaceholderForm(props: Props) {
    const { placeholder } = props;
    const fetcher = useFetcher({ key: placeholder.customPlaceholderId });

    let message;

    if ((fetcher.data as ApiResponse)?.message) {
        message = (fetcher.data as ApiResponse).message;
    }

    return (
        <div style={{ display: 'flex', borderBottom: '1px solid black', paddingTop: '1rem' }}>
            <fetcher.Form method="post" key={placeholder.customPlaceholderId}>
                <input
                    type="hidden"
                    name="custom_placeholder_name"
                    value={placeholder.customPlaceholderId}
                />
                <label
                    htmlFor={`custom_placeholder_content_${placeholder.customPlaceholderId}`}
                    style={{ width: '25%' }}
                >
                    {placeholder.customPlaceholderId}:
                </label>
                <div>
                    <textarea
                        id={`custom_placeholder_content_${placeholder.customPlaceholderId}`}
                        name="custom_placeholder_content"
                        defaultValue={placeholder.customPlaceholderContent}
                    />
                    <button type="submit">Update Text Block</button>
                </div>
                {message !== undefined && <div>{message}</div>}
            </fetcher.Form>
        </div>
    );
}
