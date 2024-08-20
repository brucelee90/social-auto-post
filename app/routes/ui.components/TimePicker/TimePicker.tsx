import React from 'react';
import styles from './TimePicker.module.css';

interface Props {
    defaultValue: string;
    name: string;
}

function TimePicker(props: Props) {
    const { defaultValue, name } = props;

    return (
        <input
            className={`${styles.timepicker} w-50 form-control`}
            type="time"
            id="scheduled_time"
            required
            name={name}
            defaultValue={defaultValue}
        />
    );
}

export default TimePicker;
