import React, { useEffect, useState } from 'react';
import { PostForm } from '~/routes/global_utils/enum';
import { CustomPlaceholder } from '@prisma/client';
import { IShopifyProduct } from '~/types/types';
import { replacePlaceholders } from '~/utils/textUtils';

const initialText = `😍 {PRODUCT_TITLE} 😍

{PRODUCT_DESCRIPTION}

{PRODUCT_TAGS}

👉 Find the link to our store in our bio`;

interface Props {
    title: string;
    description: string;
    scheduledItemDesc?: string;
    placeholders: CustomPlaceholder[];
    product: IShopifyProduct;
}

function TextArea(props: Props) {
    const { title, description, placeholders, scheduledItemDesc, product } = props;

    let initialDesc =
        scheduledItemDesc && scheduledItemDesc.trim() !== '' ? scheduledItemDesc : initialText;

    const [inputText, setInputText] = useState(initialDesc);
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        const replacements: Record<string, string> = placeholders.reduce(
            (accumulator, placeholder) => ({
                ...accumulator,
                [`${placeholder.customPlaceholderId}`]: placeholder.customPlaceholderContent
            }),
            {}
        );

        const processText = (text: string) => {
            return Object.keys(replacements).reduce((currentText, key: string) => {
                const regex = new RegExp(key, 'g');
                return currentText.replace(regex, replacements[key]);
            }, text);
        };

        const displayText = replacePlaceholders(processText(inputText), product);
        setDisplayText(displayText);
    }, [inputText, product]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(event.target.value);
    };

    return (
        <div style={{ display: 'flex' }}>
            <textarea
                style={{ width: '50%' }}
                rows={10}
                name={PostForm.description}
                value={inputText}
                onChange={handleChange}
                cols={50}
            />
            <div
                dangerouslySetInnerHTML={{ __html: displayText }}
                style={{ width: '50%', whiteSpace: 'pre-wrap' }}
            />
        </div>
    );
}

export default TextArea;
