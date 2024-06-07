import { shopSettingsService } from '../../services/SettingsService.server';
import { Form, json, useFetcher, useLoaderData } from '@remix-run/react';
import { authenticate } from '~/shopify.server';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Badge, BlockStack, Card, Divider, Grid, Icon, Layout, Page, Text } from '@shopify/polaris';
import { PostForm } from '../global_utils/enum';
import { PlaceholderForm } from './components/PlaceholderForm';
import { IApiResponse } from '../global_utils/types';
import { CustomPlaceholder, DefaultCaption } from '@prisma/client';
import DefaultCaptionForm from './components/DefaultCaptionForm';
import textUtils from '~/utils/textUtils';
import { error } from 'console';
import { useState } from 'react';
import { ClipboardIcon } from '@shopify/polaris-icons';

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
            await shopSettingsService.removeCustomPlaceholder(sessionId, customPlaceholderName);
        } else {
            await shopSettingsService.upsertCustomPlaceholder(
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
    const [isCopied, setIsCopied] = useState(false);

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
        <Page fullWidth title="Settings">
            <BlockStack gap={'800'}>
                <Layout>
                    <Layout.AnnotatedSection
                        id="defaultCaption"
                        title="Set Default Caption"
                        description="The default caption will be shown by default on any post. you can alter it at the postcenter or on the schedule page"
                    >
                        <Card padding={'800'}>
                            <DefaultCaptionForm defaultCaption={defaultCaption} />
                        </Card>
                    </Layout.AnnotatedSection>
                </Layout>

                <Layout>
                    <Layout.AnnotatedSection
                        id="setCustomPlaceholders"
                        title="Set Custom Placeholders"
                        description="Create custom placheolders that you can reuse within your planned post"
                    >
                        <Card padding={'800'}>
                            <Form method="post">
                                <BlockStack gap={'400'}>
                                    <CustomPlaceholderForm
                                        handleKeyDown={handleKeyDown}
                                        handlePaste={handlePaste}
                                    />
                                </BlockStack>
                            </Form>
                        </Card>
                    </Layout.AnnotatedSection>
                </Layout>

                <Divider borderColor="border-inverse" />
                <div style={{ width: '30%' }}>
                    <BlockStack gap={'200'}>
                        <Text as="h2" variant="headingLg">
                            Your custom Placeholders
                        </Text>
                        <Text as="p" variant="bodyMd" tone="subdued">
                            Copy your custom placeholders and reuse them within the schedule and
                            postcenter
                        </Text>
                    </BlockStack>
                </div>

                <Layout>
                    {customPlaceholder?.reverse().map((customPlaceholderElement, key) => (
                        <Layout.AnnotatedSection
                            title={<PlaceholderName placeholder={customPlaceholderElement} />}
                        >
                            <Card padding={'800'}>
                                <div key={key}>
                                    <PlaceholderForm placeholder={customPlaceholderElement} />
                                </div>
                            </Card>
                        </Layout.AnnotatedSection>
                    ))}
                </Layout>
            </BlockStack>
        </Page>
    );
}

interface ICustomPlacholderFormProps {
    handleKeyDown: (event: any) => false | undefined;
    handlePaste: (event: React.ClipboardEvent<HTMLInputElement>) => void;
}

const CustomPlaceholderForm = (props: ICustomPlacholderFormProps) => {
    const { handleKeyDown, handlePaste } = props;

    return (
        <>
            <div>
                <label>Placeholder name</label>
                <div className="d-flex">
                    {/* {`{`} */}
                    <input
                        type="text"
                        name={PostForm.placeholderName}
                        defaultValue=""
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        className="form-control w-50"
                        style={{ textTransform: 'uppercase' }}
                    />
                    {/* {`}`} */}
                </div>
            </div>
            <div>
                <label htmlFor={PostForm.placeholderContent}>Placeholder value</label>
                <textarea
                    name={PostForm.placeholderContent}
                    defaultValue=""
                    className="form-control"
                    rows={5}
                />
            </div>
            <div>
                <button className="Polaris-Button Polaris-Button--pressable Polaris-Button--variantPrimary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter">
                    Add custom placeholder
                </button>
            </div>
        </>
    );
};

interface IPlaceholderNameProps {
    placeholder: {
        customPlaceholderName: string;
        customPlaceholderContent: string;
    };
}

const PlaceholderName = (props: IPlaceholderNameProps) => {
    const [isCopied, setIsCopied] = useState(false);
    const { placeholder } = props;

    return (
        <div style={{ display: 'flex' }}>
            <label htmlFor={`${PostForm.placeholderContent}_${placeholder.customPlaceholderName}`}>
                {placeholder.customPlaceholderName}
            </label>
            <div
                style={{ cursor: 'pointer' }}
                onClick={async () => {
                    await navigator.clipboard.writeText(placeholder.customPlaceholderName);
                    setIsCopied(true);
                }}
            >
                <Icon source={ClipboardIcon} tone="base" />
            </div>
            {isCopied && <Badge tone="success">Copied</Badge>}
        </div>
    );
};
