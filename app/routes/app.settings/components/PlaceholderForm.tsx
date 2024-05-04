import { useFetcher } from '@remix-run/react';
import { Icon } from '@shopify/polaris';
import { PostForm } from '~/routes/global_utils/enum';
import { ClipboardIcon } from '@shopify/polaris-icons';
import { useState } from 'react';
import { IApiResponse } from '~/routes/global_utils/types';

interface Props {
    placeholder: {
        customPlaceholderName: string;
        customPlaceholderContent: string;
    };
}

export function PlaceholderForm(props: Props) {
    const { placeholder } = props;
    const [isCopied, setIsCopied] = useState(false);
    const fetcher = useFetcher({ key: placeholder.customPlaceholderName });

    let message;

    if ((fetcher.data as IApiResponse)?.message) {
        message = (fetcher.data as IApiResponse).message;
    }

    return (
        <div>
            <fetcher.Form method="post" key={placeholder.customPlaceholderName}>
                <input
                    type="hidden"
                    name={PostForm.placeholderName}
                    value={placeholder.customPlaceholderName}
                />

                <div style={{ display: 'flex' }}>
                    <label
                        htmlFor={`${PostForm.placeholderContent}_${placeholder.customPlaceholderName}`}
                    >
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
                    {isCopied && 'copied'}
                </div>
                <div>
                    <textarea
                        id={`${PostForm.placeholderContent}_${placeholder.customPlaceholderName}`}
                        name={PostForm.placeholderContent}
                        defaultValue={placeholder.customPlaceholderContent}
                        rows={10}
                        style={{ width: '50%' }}
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
