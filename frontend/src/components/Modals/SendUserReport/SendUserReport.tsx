import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import Button from '@/components/UI/Button/Button';
import InputWithTitle from '@/components/UI/Input/InputWithTitle/InputWithTitle';

import { useModal } from '@/context/useModalContext';

import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';
import { IReportForm } from '@/lib/types/services/report.type';

import { UserService } from '@/services/user.service';

import './sendUserReport.scss';

export function SendUserReport({ userId }: { userId: number }) {
    const t = useTranslations('Modals.SendUserReport');

    const { togglePopup } = useModal();
    const [step, setStep] = useState(1);

    const {
        register,
        formState: { isValid },
        handleSubmit,
    } = useForm<IReportForm>({
        mode: 'onChange',
        defaultValues: {
            user_id: Number(userId),
            text: null,
        },
    });

    const { mutateAsync, isPending } = useMutation({
        mutationKey: ['send-report'],
        mutationFn: async (data: IReportForm) => await UserService.sendReport(data),
    });

    const sendReport: SubmitHandler<IReportForm> = async (data) => {
        await mutateAsync(data, {
            onSuccess: async () => {
                setStep(2);
            },
            onError: async (error) => await ApiErrorHandler(error, "Couldn't send a report"),
        });
    };

    return (
        <div className="modal-dialog send-user-report">
            <AnimatePresence>
                {step === 1 && (
                    <m.form onSubmit={handleSubmit(sendReport)} transition={{ duration: 1 }} exit={{ opacity: 0 }}>
                        <h2>{t('Title')}</h2>
                        <div className="send-user-report__form">
                            <InputWithTitle
                                title={t('Placeholder')}
                                {...register('text', { required: true, minLength: 5 })}
                            />
                            <small>{t('Hint')}</small>
                        </div>

                        <div className="send-user-report__controls">
                            <Button variant={'active'} type="submit" disabled={!isValid} isLoading={isPending}>
                                {t('Send')}
                            </Button>
                            <Button variant={'stroke'} type="button" onClick={() => togglePopup(false)}>
                                {t('Close')}
                            </Button>
                        </div>
                    </m.form>
                )}
                {step === 2 && (
                    <m.div
                        className="send-user-report__finish"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
                        <h2>{t('Thank')}</h2>
                        <small>{t('TankDescription')}</small>
                        <div className="send-user-report__controls">
                            <Button variant={'stroke'} type="button" onClick={() => togglePopup(false)}>
                                {t('Close')}
                            </Button>
                        </div>
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
}
