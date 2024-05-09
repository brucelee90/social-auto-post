import { DefaultCaption } from '@prisma/client';
import { useFetcher } from '@remix-run/react';
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
