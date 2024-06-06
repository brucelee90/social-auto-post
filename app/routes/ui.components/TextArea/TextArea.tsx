import React, { useEffect, useState } from 'react';
import { PostForm } from '~/routes/global_utils/enum';
import { CustomPlaceholder } from '@prisma/client';
import { IShopifyProduct } from '~/routes/global_utils/types';
import textUtils from '~/utils/textUtils';
import styles from './TextArea.module.css';
// import { replacePlaceholders } from '~/utils/textUtils';

interface Props {
    scheduledItemDesc?: string;
    placeholders: CustomPlaceholder[] | null | undefined;
    product: IShopifyProduct;
    defaultCaption: string;
}

function TextArea(props: Props) {
    const { placeholders, scheduledItemDesc, product, defaultCaption } = props;

    let initialDesc =
        scheduledItemDesc && scheduledItemDesc.trim() !== '' ? scheduledItemDesc : defaultCaption;

    const [inputText, setInputText] = useState(initialDesc);
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        const displayText = textUtils.replacePlaceholders(inputText, product, placeholders);
        setDisplayText(displayText);
    }, [inputText, product]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(event.target.value);
    };

    return (
        <div className="pb-4 row mx-0">
            <textarea
                style={{ width: '50%' }}
                rows={10}
                name={PostForm.description}
                value={inputText}
                onChange={handleChange}
                cols={50}
                className={`${styles.textarea} form-control`}
            />
            <div
                dangerouslySetInnerHTML={{ __html: displayText }}
                style={{ width: '50%', whiteSpace: 'pre-wrap' }}
            />
        </div>
    );
}

TextArea.defaultProps = {
    defaultCaption: `😍 {PRODUCT_TITLE} 😍

{PRODUCT_DESCRIPTION}

{PRODUCT_TAGS}

👉 Find the link to our store in our bio`
};

export default TextArea;
