import React, { useState } from 'react';
import { PostForm } from '~/routes/global_utils/enum';

interface Props {
    images: { url: string }[];
    scheduledItemImgUrls?: string;
}

function ImagePicker(props: Props) {
    const { images, scheduledItemImgUrls } = props;
    const [isChecked, setIsChecked] = useState(false);

    const handleCheckboxChange = (e: any) => {
        setIsChecked(e.target.checked);
    };

    return (
        <ul>
            <fieldset style={{ display: 'flex' }}>
                {images.map((e, key) => {
                    let isCurrentImageSelected = scheduledItemImgUrls?.includes(e.url);

                    return (
                        <li key={key}>
                            <input
                                type="checkbox"
                                id={PostForm.imgUrl}
                                name={PostForm.imgUrl}
                                value={e.url}
                                onChange={handleCheckboxChange}
                                required={!isChecked}
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
