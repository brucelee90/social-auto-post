import settingsService, { getSettings } from '../../services/SettingsService.server';
import { Form, json, useFetcher, useLoaderData } from '@remix-run/react';
import { authenticate } from '~/shopify.server';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Text } from '@shopify/polaris';
import { PostForm } from '../global_utils/enum';
import { PlaceholderForm } from './components/PlaceholderForm';
import { IApiResponse } from '../global_utils/types';
import { DefaultCaption } from '@prisma/client';

function createApiResponse(success: boolean, message: string) {
    return { success, message } as IApiResponse;
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
        defaultCaption: shopSettings?.defaultCaption,
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
    let defaultCaption = formData.get('default_caption') as string;
    let handledefaultCaption = formData.get('handle_default_caption') as string;

    try {
        if (handledefaultCaption !== null) {
            settingsService.saveDefaultCaption(shop, defaultCaption);
            return createApiResponse(true, 'Saved successfully');
        } else if (handlePlaceholder === 'remove') {
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
    const { customPlaceholder, defaultCaption } = useLoaderData<typeof loader>();

    return (
        <div>
            <Text as="h1" variant="headingLg">
                Settings
            </Text>

            <hr />

            <Text as="h2" variant="headingLg">
                Set Default Caption
            </Text>

            <DefaultCaptionForm defaultCaption={defaultCaption} />

            <hr />

            <Text as="h2" variant="headingLg">
                Set Custom Placeholders
            </Text>
            {customPlaceholder?.map((customPlaceholderElement, key) => (
                <div key={key}>
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

interface IDefaultCaptionProps {
    defaultCaption: DefaultCaption[] | undefined;
}

function DefaultCaptionForm(props: IDefaultCaptionProps) {
    const fetcher = useFetcher({ key: 'default_caption' });
    const { defaultCaption } = props;
    let defaultCaptionContent = '';

    console.log('defaultCaption', defaultCaption);

    let message;
    if ((fetcher.data as IApiResponse)?.message) {
        message = (fetcher.data as IApiResponse).message;
    }

    console.log(fetcher.formData);
    if (defaultCaption !== undefined) {
        const defaultCaptionItem = defaultCaption.find((item) => item.defaultCaptionName === 'all');
        defaultCaptionContent =
            defaultCaptionItem?.defaultCaptionContent !== undefined
                ? defaultCaptionItem?.defaultCaptionContent
                : '';
    }

    return (
        <fetcher.Form method="post" key="default_caption">
            <div>
                <textarea
                    rows={10}
                    style={{ width: '50%' }}
                    id="default_caption"
                    name="default_caption"
                    defaultValue={defaultCaptionContent}
                />
                <button name="handle_default_caption" value="save">
                    save default caption
                </button>
            </div>
            {message !== undefined && <div>{message}</div>}
        </fetcher.Form>
    );
}
