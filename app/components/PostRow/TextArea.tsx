import React, { useEffect, useState } from 'react';
import { PostForm } from '~/routes/global_utils/enum';
import { CustomPlaceholder } from '@prisma/client';

const initialText = `😍 {PRODUCT_TITLE} 😍

{PRODUCT_DESCRIPTION}

👉 Find the link to our store in our bio`;

interface Props {
    title: string;
    description: string;
    scheduledItemDesc: string;
    placeholders: CustomPlaceholder[];
}

function TextArea(props: Props) {
    const { title, description, placeholders, scheduledItemDesc } = props;

    let initialDesc =
        scheduledItemDesc && scheduledItemDesc.trim() !== '' ? scheduledItemDesc : initialText;

    const [inputText, setInputText] = useState(initialDesc);
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        const fixedReplacements: Record<string, string> = {
            '{PRODUCT_TITLE}': title,
            '{PRODUCT_DESCRIPTION}': description
        };

        const dynamicReplacements: Record<string, string> = placeholders.reduce(
            (acc, placeholder) => ({
                ...acc,
                [`${placeholder.customPlaceholderId}`]: placeholder.customPlaceholderContent
            }),
            {}
        );

        const replacements = { ...fixedReplacements, ...dynamicReplacements };

        const processText = (text: string) => {
            return Object.keys(replacements).reduce((currentText, key) => {
                const regex = new RegExp(key, 'g');
                return currentText.replace(regex, replacements[key]);
            }, text);
        };

        setDisplayText(processText(inputText));
    }, [inputText, title, description, placeholders]);

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
            {/* <input type="hidden" name={PostForm.description} value={displayText} /> */}
            <div
                dangerouslySetInnerHTML={{ __html: displayText }}
                style={{ width: '50%', whiteSpace: 'pre-wrap' }}
            />
        </div>
    );
}

export default TextArea;
