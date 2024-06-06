import { useFetcher } from '@remix-run/react';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ActionMessage } from '~/routes/app.schedule/scheduleUtils';
import { PostForm } from '~/routes/global_utils/enum';
import styles from './ImagePicker.module.css';

interface Props {
    images: { url: string }[];
    scheduledItemImgUrls?: string;
}

function ImagePicker(props: Props) {
    const { images, scheduledItemImgUrls } = props;

    return (
        <ul className={styles.ul}>
            <fieldset style={{ display: 'flex' }}>
                {images.map((e, key) => {
                    let isCurrentImageSelected = false;
                    if (scheduledItemImgUrls != null) {
                        isCurrentImageSelected = scheduledItemImgUrls.includes(e.url);
                    }

                    return (
                        <ImageCheckbox
                            key={key}
                            imageElement={e}
                            isCurrentImageSelected={isCurrentImageSelected}
                        />
                    );
                })}
            </fieldset>
        </ul>
    );
}

interface ImageCheckboxProps {
    key: number;
    imageElement: { url: string };
    isCurrentImageSelected: boolean;
}

const ImageCheckbox: React.FC<ImageCheckboxProps> = (props: ImageCheckboxProps) => {
    const [checkedState, setCheckedState] = useState(false);
    const { imageElement, isCurrentImageSelected } = props;

    useEffect(() => {
        setCheckedState(isCurrentImageSelected);
    }, [isCurrentImageSelected]);

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCheckedState(e.target.checked);
    };

    return (
        <li>
            <input
                type="checkbox"
                id={imageElement.url}
                name={PostForm.imgUrl}
                value={imageElement.url}
                onChange={handleCheckboxChange}
                checked={checkedState}
            />
            <label htmlFor={imageElement.url}>
                {/* <img src="http://townandcountryremovals.com/wp-content/uploads/2013/10/firefox-logo-200x200.png" /> */}
                <img src={imageElement.url} height={150} alt="Selected" />
            </label>
        </li>
    );
};

export default ImagePicker;
