import { DefaultCaption } from '@prisma/client';
import { useFetcher } from '@remix-run/react';
import { BlockStack } from '@shopify/polaris';
import { IApiResponse } from '~/routes/global_utils/types';

interface IDefaultCaptionProps {
    defaultCaption: DefaultCaption[] | undefined;
}
export const getDefaultCaptionContent = (defaultCaption: DefaultCaption[] | null | undefined) => {
    if (defaultCaption !== undefined && defaultCaption !== null) {
        const defaultCaptionItem = defaultCaption.find((item) => item.defaultCaptionName === 'all');
        return defaultCaptionItem?.defaultCaptionContent;
    }
    return undefined;
};

export default function DefaultCaptionForm(props: IDefaultCaptionProps) {
    const fetcher = useFetcher({ key: 'default_caption' });
    const { defaultCaption } = props;
    let defaultCaptionContent = getDefaultCaptionContent(defaultCaption);

    let message;
    if ((fetcher.data as IApiResponse)?.message) {
        message = (fetcher.data as IApiResponse).message;
    }

    return (
        <fetcher.Form method="post" key="default_caption">
            <BlockStack gap={'400'}>
                <BlockStack gap={'200'}>
                    <label htmlFor="default_caption">Default caption</label>
                    <textarea
                        rows={10}
                        id="default_caption"
                        name="default_caption"
                        className="form-control"
                        defaultValue={defaultCaptionContent}
                    />
                </BlockStack>
                <div>
                    <button
                        name="handle_default_caption"
                        value="save"
                        className="Polaris-Button Polaris-Button--pressable Polaris-Button--variantPrimary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter"
                    >
                        save default caption
                    </button>
                </div>
            </BlockStack>

            {message !== undefined && <div>{message}</div>}
        </fetcher.Form>
    );
}

DefaultCaptionForm.defaultProps = {
    defaultCaption: [
        {
            defaultCaptionName: 'all',
            defaultCaptionContent: `😍 {PRODUCT_TITLE} 😍

{PRODUCT_DESCRIPTION}
        
{PRODUCT_TAGS}
        
👉 Find the link to our store in our bio`,
            settingsId: ''
        }
    ]
};
