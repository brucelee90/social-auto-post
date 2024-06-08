import DatePicker from '~/routes/ui.components/DatePicker/DatePicker';
import { Action, PostStatus } from '../../global_utils/enum';
import { JobAction as BtnAction } from '../../global_utils/enum';
import { useFetcher } from '@remix-run/react';
import { IApiResponse } from '../route';
import moment from 'moment';
import TimePicker from '~/routes/ui.components/TimePicker/TimePicker';
import { BlockStack, Divider, Text } from '@shopify/polaris';

interface ButtonProps {
    action: string;
    text: string;
    className?: string;
}
interface Props {
    productId: string;
    isScheduleSuccessfull: boolean;
    scheduledDate: string;
    scheduleStatus: 'draft' | 'scheduled' | 'posted';
    isDisabled: boolean;
}

export function PostBtn(props: Props) {
    const { productId, isScheduleSuccessfull, scheduledDate, scheduleStatus, isDisabled } = props;

    const fetcher = useFetcher({ key: `${productId}` });

    let actionProductId;
    let action;
    let actionMessage = '';

    if (fetcher.data as IApiResponse) {
        action = (fetcher.data as IApiResponse).action;
        actionMessage = (fetcher.data as IApiResponse).message;
        actionProductId = (fetcher.data as IApiResponse).productId;
    }

    let btnText = 'Schedule Post';
    let btnAction = BtnAction.schedule;

    let isScheduled = action == Action.schedule;
    let isCancelled = action === Action.cancel;

    let hasScheduledDate = scheduleStatus === PostStatus.scheduled;
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

    let formattedScheduledDate = '';
    let formattedScheduledTime = '';

    if (moment().isBefore(scheduledDate)) {
        formattedScheduledDate = moment(scheduledDate).format('YYYY-MM-DD');
        formattedScheduledTime = moment(scheduledDate).format('hh:mm');
    }

    return (
        <BlockStack gap={'400'}>
            <div>{actionMessage}</div>
            {!isProductScheduled && (
                <BlockStack gap={'200'}>
                    <div>
                        <Text variant="headingSm" as="h6">
                            Please select a Date and Time For Scheduling
                        </Text>
                    </div>
                    <div className="d-flex w-50 ">
                        <DatePicker name={`scheduled_date`} defaultValue={formattedScheduledDate} />
                        <TimePicker name="scheduled_time" defaultValue={formattedScheduledTime} />
                    </div>
                </BlockStack>
            )}
            <Divider borderColor="border-inverse" />
            <BlockStack gap={'200'}>
                {isDisabled && (
                    <Text variant="bodyMd" as="p">
                        Please go to your dashboard and connect your social media account first in
                        order to start scheduling
                    </Text>
                )}
                <div>
                    <Button
                        className={`Polaris-Button Polaris-Button--pressable Polaris-Button--variantPrimary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter me-3 ${isDisabled === true && 'Polaris-Button--disabled'}`}
                        action={btnAction}
                        text={btnText}
                    />

                    <Button
                        className={`Polaris-Button Polaris-Button--pressable Polaris-Button--variantTertiary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter ${isDisabled === true && 'Polaris-Button--disabled'}`}
                        action={BtnAction.draft}
                        text="Save as draft"
                    />
                </div>
            </BlockStack>
        </BlockStack>
    );
}

function Button(props: ButtonProps) {
    const { action, text, className } = props;

    return (
        <button className={className} type="submit" name={action} value={action}>
            {text}
        </button>
    );
}
