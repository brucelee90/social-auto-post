import { useState } from 'react';
import settingsService, { getSettings } from '../../services/SettingsService.server';
import { Form, json, useActionData, useFetcher, useLoaderData } from '@remix-run/react';
import { authenticate } from '~/shopify.server';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Text } from '@shopify/polaris';
import { PostForm } from '../global_utils/enum';

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
    let handlePlaceholder = formData.get('handle_placeholder') as string;
    let customPlaceholderName = formData.get(PostForm.placeholderName) as string;
    let customPlaceholderContent = formData.get(PostForm.placeholderContent) as string;

    try {
        if (handlePlaceholder === 'remove') {
            await settingsService.removeCustomPlaceholder(shop, customPlaceholderName);
        } else {
            await settingsService.upsertCustomPlaceholder(
                shop,
                customPlaceholderName,
                customPlaceholderContent
            );
        }
        return createApiResponse(true, 'Settings updated successfully.');
    } catch (error) {
        console.log(error, 'error while saving setting');
        return createApiResponse(false, 'Failed to update settings.');
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
                    <label htmlFor={PostForm.placeholderName}>Placeholder name</label>
                    <input type="text" name={PostForm.placeholderName} defaultValue="" />
                </div>
                <div>
                    <label htmlFor={PostForm.placeholderContent}>Placeholder value</label>
                    <textarea name={PostForm.placeholderContent} defaultValue="" />
                </div>
                <button>Add new Text block</button>
            </Form>
        </div>
    );
}

interface Props {
    placeholder: {
        customPlaceholderName: string;
        customPlaceholderContent: string;
    };
}

function PlaceholderForm(props: Props) {
    const { placeholder } = props;
    const fetcher = useFetcher({ key: placeholder.customPlaceholderName });

    let message;

    if ((fetcher.data as ApiResponse)?.message) {
        message = (fetcher.data as ApiResponse).message;
    }

    return (
        <div style={{ display: 'flex', borderBottom: '1px solid black', paddingTop: '1rem' }}>
            <fetcher.Form method="post" key={placeholder.customPlaceholderName}>
                <input
                    type="hidden"
                    name={PostForm.placeholderName}
                    value={placeholder.customPlaceholderName}
                />
                <label
                    htmlFor={`${PostForm.placeholderContent}_${placeholder.customPlaceholderName}`}
                    style={{ width: '25%' }}
                >
                    {placeholder.customPlaceholderName}:
                </label>
                <div>
                    <textarea
                        id={`${PostForm.placeholderContent}_${placeholder.customPlaceholderName}`}
                        name={PostForm.placeholderContent}
                        defaultValue={placeholder.customPlaceholderContent}
                    />
                    <button type="submit" name="handle_placeholder" value="update">
                        Update Text Block
                    </button>
                    <button type="submit" name="handle_placeholder" value="remove">
                        Delete Text Block
                    </button>
                </div>
                {message !== undefined && <div>{message}</div>}
            </fetcher.Form>
        </div>
    );
}
