import moment from 'moment';
import { useState } from 'react';
import DatePicker from '~/routes/ui.components/mediaqueue/DatePicker';
import { Action } from '../../global_utils/enum';
import { JobAction as BtnAction } from '../../global_utils/enum';
import { useFetcher } from '@remix-run/react';
import { IApiResponse } from '../route';

interface ButtonProps {
    action: string;
    text: string;
}
interface Props {
    productId: string;
    isScheduleSuccessfull: boolean;
    scheduledDate: string;
}

export function PostBtn(props: Props) {
    const { productId, isScheduleSuccessfull, scheduledDate } = props;

    const fetcher = useFetcher({ key: `${productId}` });

    let actionProductId;
    let action;
    let actionMessage = '';

    if (fetcher.data as IApiResponse) {
        action = (fetcher.data as IApiResponse).action;
        actionMessage = (fetcher.data as IApiResponse).message;
        actionProductId = (fetcher.data as IApiResponse).productId;
    }

    console.log(action, actionMessage);

    let btnText = 'Schedule Post';
    let btnAction = BtnAction.schedule;

    let isScheduled = action == Action.schedule;
    let isCancelled = action === Action.cancel;

    let hasScheduledDate = scheduledDate !== undefined;
    let isProductScheduled = (isScheduled && actionProductId) || hasScheduledDate;

    // A cancellation will override everything
    if (actionProductId && isCancelled) {
        isProductScheduled = false;
    }

    if (isProductScheduled && isScheduleSuccessfull) {
        btnText = 'Cancel and Reschedule Post';
        btnAction = BtnAction.cancel;
    } else if (isProductScheduled && !isScheduleSuccessfull) {
        btnText = 'Retry Schedule';
    }

    return (
        <div>
            <div>{actionMessage}</div>
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

function Button(props: ButtonProps) {
    const { action, text } = props;

    return (
        <button type="submit" name={action} value={action}>
            {text}
        </button>
    );
}
