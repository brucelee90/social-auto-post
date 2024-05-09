import settingsService, {
    getSettings,
    shopSettingsService
} from '../../services/SettingsService.server';
import { Form, json, useFetcher, useLoaderData } from '@remix-run/react';
import { authenticate } from '~/shopify.server';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Text } from '@shopify/polaris';
import { PostForm } from '../global_utils/enum';
import { PlaceholderForm } from './components/PlaceholderForm';
import { IApiResponse } from '../global_utils/types';
import { CustomPlaceholder, DefaultCaption } from '@prisma/client';
import DefaultCaptionForm from './components/DefaultCaptionForm';
import textUtils from '~/utils/textUtils';
import { error } from 'console';

function createApiResponse(success: boolean, message: string) {
    return { success, message } as IApiResponse;
}

export async function loader({ request }: LoaderFunctionArgs) {
    const { session } = await authenticate.admin(request);
    const { shop, id: sessionId } = session;

    let shopSettings = null;
    try {
        shopSettings = await shopSettingsService.getShopSettings(sessionId);
    } catch (error) {
        console.log('error while getting settings');
    }

    return json({
        customPlaceholder: shopSettings?.settings?.customPlaceholder,
        defaultCaption: shopSettings?.settings?.defaultCaption,
        shopSettings: shopSettings
    });
}

export async function action({ request }: ActionFunctionArgs) {
    const { session } = await authenticate.admin(request);
    const { id: sessionId } = session;

    const formData = await request.formData();
    let handlePlaceholder = formData.get('handle_placeholder') as string;
    let customPlaceholderName = formData.get(PostForm.placeholderName) as string;
    let customPlaceholderContent = formData.get(PostForm.placeholderContent) as string;
    let defaultCaption = formData.get('default_caption') as string;
    let handledefaultCaption = formData.get('handle_default_caption') as string;

    try {
        if (handledefaultCaption !== null) {
            shopSettingsService.upsertDefaultCaption(sessionId, defaultCaption);
            return createApiResponse(true, 'Saved successfully');
        } else if (handlePlaceholder === 'remove') {
            await settingsService.removeCustomPlaceholder(sessionId, customPlaceholderName);
        } else {
            await settingsService.upsertCustomPlaceholder(
                sessionId,
                textUtils.placeholderSanitizer(customPlaceholderName),
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

    const handleKeyDown = (event: any) => {
        const { keyCode, key } = event;
        const allowedKeys = [8, 9, 13, 37, 38, 39, 40]; // Control keys like backspace, tab, enter, arrows

        if (allowedKeys.includes(keyCode)) {
            return; // Allow these keys for navigation/control purposes
        }

        if (key === ' ') {
            event.preventDefault();
            const input = event.currentTarget;
            const start = input.selectionStart;
            const end = input.selectionEnd;
            input.value = input.value.slice(0, start) + '_' + input.value.slice(end);
            input.setSelectionRange(start + 1, start + 1);
            return;
        }

        const regex = /^[a-zA-Z_]+$/;
        if (!regex.test(key)) {
            event.preventDefault();
            return false;
        }
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault(); // Stop data actually being pasted
        let paste = event.clipboardData.getData('text');
        const uppercasePaste = paste.replace(/[^A-Z_]/g, ''); // Remove non-uppercase characters
        event.currentTarget.value += uppercasePaste; // Append filtered text
    };

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
                    {`{`}
                    <input
                        type="text"
                        name={PostForm.placeholderName}
                        defaultValue=""
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        style={{ textTransform: 'uppercase' }}
                    />
                    {`}`}
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
