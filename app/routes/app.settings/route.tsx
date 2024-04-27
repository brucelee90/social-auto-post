import { useState } from 'react';
import settingsService, { getSettings } from '../../services/SettingsService.server';
import { Form, json, useActionData, useLoaderData } from '@remix-run/react';
import { authenticate } from '~/shopify.server';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Text } from '@shopify/polaris';
const logger = require('winston');

function createApiResponse(success: boolean, message: string) {
    return { success, message };
}

export async function loader({ request }: LoaderFunctionArgs) {
    const { session } = await authenticate.admin(request);
    const { shop } = session;
    let shopSettings = null;
    try {
        shopSettings = await getSettings(shop);
    } catch (error) {
        logger.error(`Failed to get settings for shop ${shop}: ${(error as Error).message}`, {
            error
        });
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
        logger.error(`Failed to save settings for shop ${shop}: ${(error as Error).message}`, {
            error
        });
        return createApiResponse(false, 'Failed to save settings.');
    }
}

interface Props {}

export default function Settings(props: Props) {
    const {} = props;
    const { customPlaceholder } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();

    return (
        <div>
            <Text as="h1" variant="headingLg">
                Settings
            </Text>

            {customPlaceholder?.map((e, key) => (
                <div
                    key={key}
                    style={{ display: 'flex', borderBottom: '1px solid black', paddingTop: '1rem' }}
                >
                    <Form method="post">
                        <input
                            type="hidden"
                            name="custom_placeholder_name"
                            value={e.customPlaceholderId}
                        />
                        <label htmlFor="custom_placeholder_content" style={{ width: '25%' }}>
                            {e.customPlaceholderId}:
                        </label>
                        <div>
                            <textarea
                                name="custom_placeholder_content"
                                defaultValue={e.customPlaceholderContent}
                            />
                            <button type="submit">Update Text Block</button>
                        </div>
                    </Form>
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
