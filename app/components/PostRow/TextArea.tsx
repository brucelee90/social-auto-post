import React, { useEffect, useState } from 'react';

interface Props {
    title: string;
    description: string;
}

function TextArea(props: Props) {
    const { title, description } = props;
    const initialText = `{PRODUCT_TITLE} {PRODUCT_DESCRIPTION}`; // Starttext mit Platzhaltern für das Textfeld

    const [inputText, setInputText] = useState(initialText);
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        // Initialisiere displayText mit den ersetzten Werten
        processText(inputText);
    }, [title, description]); // Reagiere auf Änderungen von `title` und `description`

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = event.target.value;
        setInputText(newText);
        processText(newText);
    };

    const processText = (text: string) => {
        // Ersetzt die Platzhalter in displayText
        let updatedText = text.replace(/{PRODUCT_TITLE}/g, title);
        updatedText = updatedText.replace(/{PRODUCT_DESCRIPTION}/g, description);
        setDisplayText(updatedText);
    };

    return (
        <div style={{ display: 'flex' }}>
            <textarea
                style={{ width: '50%' }}
                rows={10}
                name="description"
                value={inputText}
                onChange={handleChange}
                cols={50}
            />
            <div dangerouslySetInnerHTML={{ __html: displayText }} style={{ width: '50%' }}></div>
        </div>
    );
}

export default TextArea;
