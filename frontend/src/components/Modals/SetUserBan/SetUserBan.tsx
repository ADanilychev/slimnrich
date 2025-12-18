'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import Button from '@/components/UI/Button/Button';
import { SelectInput } from '@/components/UI/Input/SelectInput/SelectInput';

import { useModal } from '@/context/useModalContext';

import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';
import { IBanForm } from '@/lib/types/services/admin.type';

import { AdminService } from '@/services/admin.service';
import { ReportService } from '@/services/report.service';

import './setUserBan.scss';

const BAN_BATTLE = [
    {
        text: '1 day',
        value: 1,
    },
    {
        text: '1 week',
        value: 7,
    },
    {
        text: '2 weeks',
        value: 14,
    },
    {
        text: '1 month',
        value: 30,
    },
    {
        text: '3 months',
        value: 90,
    },
    {
        text: '6 months',
        value: 180,
    },
    {
        text: '1 year',
        value: 365,
    },
];

export function SetUserBan({
    payload,
}: {
    payload: { violator_id: number; useModeration?: boolean; report_id?: number };
}) {
    const { togglePopup } = useModal();
    const queryClient = useQueryClient();

    const {
        handleSubmit,
        control,
        watch,
        formState: { isValid },
    } = useForm<IBanForm>({
        mode: 'onChange',
        defaultValues: {
            violator_id: payload.violator_id,
            period: BAN_BATTLE[0].value,
        },
    });

    const { mutateAsync, isPending } = useMutation({
        mutationKey: ['set-user-ban'],
        mutationFn: async (payload: IBanForm) => AdminService.setBanUser(payload),
    });

    const { mutateAsync: sendModerationReport, isPending: isPendingSendModerationReport } = useMutation({
        mutationKey: ['send-moderation-report'],
        mutationFn: async (status: boolean) => ReportService.reportModeration(payload?.report_id || 0, status),
    });

    const onSubmit: SubmitHandler<IBanForm> = async (data) => {
        await mutateAsync(data, {
            onSuccess: async () => {
                if (!payload.useModeration) {
                    const { toast } = await import('react-hot-toast');
                    toast.success('User is banned');

                    queryClient.invalidateQueries({ queryKey: ['fetch-moderation-other-profile'] });
                    togglePopup(false);
                } else {
                    sendModerationReportHandler(true);
                }
            },
            onError: async (error) => await ApiErrorHandler(error, 'Error'),
        });
    };

    const sendModerationReportHandler = async (isApprove: boolean) => {
        if (isApprove) {
            await sendModerationReport(true, {
                onSuccess: async () => {
                    const { toast } = await import('react-hot-toast');
                    toast.success('User is banned and moderation is send');

                    queryClient.invalidateQueries({ queryKey: ['fetch-moderation-user-reports'] });
                    togglePopup(false);
                },
                onError: async (error) => await ApiErrorHandler(error, 'Error'),
            });
        } else {
            await sendModerationReport(false, {
                onSuccess: async () => {
                    const { toast } = await import('react-hot-toast');
                    toast.success('Moderation report is send');

                    queryClient.invalidateQueries({ queryKey: ['fetch-moderation-user-reports'] });
                    togglePopup(false);
                },
                onError: async (error) => await ApiErrorHandler(error, 'Error'),
            });
        }
    };

    const selectedPeriod = useMemo(() => {
        return BAN_BATTLE.findLast((b) => b.value === watch('period'));
    }, [watch('period')]);

    return (
        <div className="modal-dialog set-ban-modal">
            <div className="set-ban-modal__top">
                <h3>{payload.useModeration ? 'Select the decision for report' : 'Select the duration for the ban'}</h3>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="set-ban-modal__content">
                    <Controller
                        name="period"
                        control={control}
                        render={({ field }) => (
                            <SelectInput
                                title={''}
                                data={BAN_BATTLE}
                                selectedElement={selectedPeriod}
                                onSelectHandler={(ban) => {
                                    field.onChange(ban.value);
                                }}
                                render={(item) => (
                                    <p style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>{item.text}</p>
                                )}
                                displayFn={(item) => `${item?.text}`}
                            />
                        )}
                    />
                </div>

                <div className="set-ban-modal__buttons">
                    <Button variant="active" type="submit" disabled={!isValid} isLoading={isPending}>
                        {payload.useModeration ? 'Approve report' : 'Confirm'}
                    </Button>

                    {payload.useModeration && (
                        <Button
                            variant="red"
                            type="button"
                            isLoading={isPendingSendModerationReport}
                            onClick={() => sendModerationReportHandler(false)}
                        >
                            Decline report
                        </Button>
                    )}
                    <Button variant="stroke" type="button" onClick={() => togglePopup(false)}>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
