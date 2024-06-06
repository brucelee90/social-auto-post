import moment from 'moment';
import React, { useState } from 'react';
import styles from './DatePicker.module.css';

interface Props {
    name: string;
    defaultValue: string;
}

function DatePicker(props: Props) {
    let { name, defaultValue } = props;

    const minDate = moment().format('YYYY-MM-DD');
    const maxDate = moment().add(3, 'months').format('YYYY-MM-DD');

    if (defaultValue === '' || defaultValue === undefined) {
        // set defaultValue to min date if nothing else is defined
        defaultValue = minDate;
    }

    const [selectedDate, setselectedDate] = useState(defaultValue);

    const handleDateSelect = (e: any) => {
        setselectedDate(e.target.value);
    };

    return (
        <input
            className={`${styles.date_picker} w-50 form-control me-3`}
            type="date"
            id="scheduled_date"
            name={name}
            value={selectedDate}
            min={minDate}
            max={maxDate}
            onChange={handleDateSelect}
        />
    );
}

export default DatePicker;
