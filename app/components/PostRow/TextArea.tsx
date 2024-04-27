import React, { useEffect, useState } from 'react';
import { PostForm } from '~/routes/global_utils/enum';

const initialText = `😍 {PRODUCT_TITLE} 😍

{PRODUCT_DESCRIPTION}

👉 Find the link to our store in our bio`;

interface Props {
    title: string;
    description: string;
}

function TextArea(props: Props) {
    const { title, description } = props;

    const [inputText, setInputText] = useState(initialText);
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        processText(inputText);
    }, [title, description]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = event.target.value;
        setInputText(newText);
        processText(newText);
    };

    const processText = (text: string) => {
        let updatedText = text
            .replace(/{PRODUCT_TITLE}/g, title)
            .replace(/{PRODUCT_DESCRIPTION}/g, description);
        setDisplayText(updatedText);
    };

    return (
        <div style={{ display: 'flex' }}>
            <textarea
                style={{ width: '50%' }}
                rows={10}
                name="description_test"
                value={inputText}
                onChange={handleChange}
                cols={50}
            />
            <input type="hidden" name={PostForm.description} value={displayText} />
            <div
                dangerouslySetInnerHTML={{ __html: displayText }}
                style={{ width: '50%', whiteSpace: 'pre-wrap' }}
            />
        </div>
    );
}

export default TextArea;
