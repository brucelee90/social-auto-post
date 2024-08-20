import { useFetcher } from '@remix-run/react';
import { Badge, BlockStack, Icon, Tooltip } from '@shopify/polaris';
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
    const fetcher = useFetcher({ key: placeholder.customPlaceholderName });

    let message;

    if ((fetcher.data as IApiResponse)?.message) {
        message = (fetcher.data as IApiResponse).message;
    }

    return (
        <div>
            <fetcher.Form method="post" key={placeholder.customPlaceholderName}>
                <BlockStack gap={'800'}>
                    <input
                        type="hidden"
                        name={PostForm.placeholderName}
                        value={placeholder.customPlaceholderName}
                    />

                    <textarea
                        className="form-control"
                        id={`${PostForm.placeholderContent}_${placeholder.customPlaceholderName}`}
                        name={PostForm.placeholderContent}
                        defaultValue={placeholder.customPlaceholderContent}
                        rows={10}
                    />
                    <div>
                        <button
                            type="submit"
                            name="handle_placeholder"
                            value="update"
                            className="Polaris-Button Polaris-Button--pressable Polaris-Button--variantPrimary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter me-3"
                        >
                            Update Text Block
                        </button>
                        <button
                            type="submit"
                            name="handle_placeholder"
                            value="remove"
                            className="Polaris-Button Polaris-Button--pressable Polaris-Button--variantTertiary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter"
                        >
                            Delete Custom Placeholder
                        </button>
                    </div>
                    {message !== undefined && <div>{message}</div>}
                </BlockStack>
            </fetcher.Form>
        </div>
    );
}
