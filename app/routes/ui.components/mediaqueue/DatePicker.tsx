import moment from 'moment';
import React, { useState } from 'react';

interface Props {
    // selectedDate: string;
    // minDate: string;
    // maxDate: string;
    // handleDateSelect: (e: any) => void;
    name: string;
}

function DatePicker(props: Props) {
    const { name } = props;

    const minDate = moment().format('YYYY-MM-DD');
    const maxDate = moment().add(3, 'months').format('YYYY-MM-DD');

    const [selectedDate, setselectedDate] = useState(minDate);

    const handleDateSelect = (e: any) => {
        setselectedDate(e.target.value);
    };

    return (
        <input
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
