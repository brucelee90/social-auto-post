import React from 'react';
import { PostForm } from '~/routes/global_utils/enum';

interface Props {
    description: string;
}

function TextArea(props: Props) {
    const { description } = props;

    return (
        <textarea
            style={{ width: '50%' }}
            rows={10}
            name={PostForm.description}
            defaultValue={description}
            cols={50}
        />
    );
}

export default TextArea;
