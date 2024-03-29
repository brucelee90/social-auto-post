import moment from 'moment';
import { useState } from 'react';
import DatePicker from '~/components/mediaqueue/DatePicker';
import { Action } from '../../global_utils/enum';
import { JobAction as BtnAction } from '../../global_utils/enum';

interface Props {
    actionProductId: string | undefined;
    productId: string;
    actionMessage: string | undefined;
    isScheduleSuccessfull: boolean;
    scheduledDate: string;
    action: string;
}

export function PostBtn(props: Props) {
    const {
        actionProductId,
        productId,
        actionMessage,
        isScheduleSuccessfull,
        scheduledDate,
        action
    } = props;

    const [scheduledDateStr] = useState(scheduledDate);

    let btnText = 'Schedule Post';
    let btnAction = BtnAction.schedule;

    let isScheduled = action == Action.schedule;
    let isCancelled = action === Action.cancel;
    let notification = actionMessage;

    let isCurrentProductEdited = actionProductId === productId;
    let hasScheduledDate = scheduledDateStr !== undefined;
    let isProductScheduled = (isScheduled && isCurrentProductEdited) || hasScheduledDate;

    // A cancellation will override everything
    if (isCurrentProductEdited && isCancelled) {
        isProductScheduled = false;
    }

    if (scheduledDate) {
        notification = `Set to be scheduled on ${moment(scheduledDate).format('YYYY MM DD')} at ${moment(scheduledDate).format('hh:mm')}`;
    }

    if (isProductScheduled && isScheduleSuccessfull) {
        btnText = 'Cancel and Reschedule Post';
        btnAction = BtnAction.cancel;
    } else if (isProductScheduled && !isScheduleSuccessfull) {
        btnText = 'Retry Schedule';
    }

    return (
        <div>
            <div>{notification}</div>
            {!isProductScheduled && (
                <div>
                    <DatePicker name={`scheduled_date`} />
                    <input type="time" id="scheduled_time" name={`scheduled_time`} />
                </div>
            )}
            <Button action={btnAction} text={btnText} />
        </div>
    );
}

interface ButtonProps {
    action: string;
    text: string;
}
function Button(props: ButtonProps) {
    const { action, text } = props;

    return (
        <button type="submit" name={action} value={action}>
            {text}
        </button>
    );
}
