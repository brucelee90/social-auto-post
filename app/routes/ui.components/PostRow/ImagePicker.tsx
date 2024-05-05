import React from 'react';
import { PostForm } from '~/routes/global_utils/enum';

interface Props {
    images: { url: string }[];
}

function ImagePicker(props: Props) {
    const { images } = props;

    return (
        <ul>
            <fieldset style={{ display: 'flex' }}>
                {images.map((e, key) => {
                    return (
                        <li key={key}>
                            <input
                                type="checkbox"
                                id={PostForm.imgUrl}
                                name={PostForm.imgUrl}
                                value={e.url}
                            />
                            <img src={e.url} height={150} />
                        </li>
                    );
                })}
            </fieldset>
        </ul>
    );
}

export default ImagePicker;
