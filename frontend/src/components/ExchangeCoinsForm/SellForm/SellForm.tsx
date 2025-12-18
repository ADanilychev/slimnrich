import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { SubmitHandler, useForm } from 'react-hook-form';

import Button from '@/components/UI/Button/Button';
import InputWithTitle from '@/components/UI/Input/InputWithTitle/InputWithTitle';
import { PlayButton } from '@/components/UI/PlayButton/PlayButton';

import { TPaymentMethod } from '@/lib/configs/Payment.config';
import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';
import { formatter } from '@/lib/helpers/format.helper';
import { IWithdrawPayload } from '@/lib/types/services/balance.type';

import SelectPayment from '../SelectPayment/SelectPayment';

import { useRouter } from '@/i18n/routing';
import { BalanceService } from '@/services/balance.service';

import './sellForm.scss';

interface ISellForm {
    type: TPaymentMethod;
    amount: number | null;
    wallet?: string;
}

export function SellForm() {
    const queryClient = useQueryClient();
    const t = useTranslations('SellForm');
    const router = useRouter();

    const {
        register,
        setValue,
        getValues,
        watch,
        handleSubmit,
        trigger,
        reset,
        formState: { isValid, errors },
    } = useForm<ISellForm>({
        mode: 'onChange',
        defaultValues: {
            type: 'crypto',
            amount: 0,
        },
    });

    const { mutateAsync, isPending } = useMutation({
        mutationKey: ['top-up-balance'],
        mutationFn: async (payload: IWithdrawPayload) => BalanceService.withdrawBalance(payload),
    });

    const submit: SubmitHandler<ISellForm> = async (data) => {
        if (getValues('type') === 'crypto') {
            await mutateAsync(
                {
                    ...data,
                    amount: Number(getValues('amount')),
                    method: 'crypto',
                },
                {
                    onSuccess: async () => {
                        queryClient.invalidateQueries({ queryKey: ['get-user-basic-data'] });

                        const { toast } = await import('react-hot-toast');
                        toast.success('Successfully');

                        reset();
                    },
                    onError: async (error) => ApiErrorHandler(error, "Couldn't sell slims"),
                },
            );
        }
    };

    const displayTotal = () => {
        const value = Math.round(Number(watch('amount')) / 100 - 1);

        if (value < 0) {
            return 0;
        }

        return formatter.format(value);
    };

    return (
        <form className="exchange-form sell-form" onSubmit={handleSubmit(submit)}>
            <SelectPayment
                type="sell"
                selected={watch('type')}
                onChange={(payment) => {
                    setValue('type', payment.type);
                    trigger('amount');
                }}
            />
            <span className="exchange-form__line" />

            <InputWithTitle
                title={t('Amount')}
                id="exchange-amount"
                {...register('amount', {
                    required: true,
                    validate: (value) => {
                        if (watch('type') === 'crypto') {
                            if (!value || value < 1100 || value > 100000) return 'Min:1100, Max: 100000';
                        }

                        return true;
                    },
                })}
                errorMessage={errors.amount?.message}
                showErrorTooltip={true}
                isError={!!errors.amount}
                type="number"
                inputMode="numeric"
            />

            <div className="exchange-form__control">
                <div className="exchange-form__info">
                    <div>
                        <small className="exchange-form__text">{t('Receive')}</small>
                        <p className="exchange-form__total">
                            ~{displayTotal()} {t('USDT')}
                        </p>
                    </div>
                </div>
            </div>

            <span className="exchange-form__line" />

            <div className="exchange-form__section sell-form__info">
                <InputWithTitle
                    title={t('EnterWallet')}
                    {...register('wallet', { required: true })}
                    placeholder="XXXXXX"
                />
            </div>

            <span className="exchange-form__line" />
            <div className="exchange-form__buttons">
                <Button variant={'active'} disabled={!isValid} isLoading={isPending}>
                    {t('Confirm')}
                </Button>
                <PlayButton onClick={() => router.push('https://t.me/slimandrich/53')} />
            </div>
        </form>
    );
}
