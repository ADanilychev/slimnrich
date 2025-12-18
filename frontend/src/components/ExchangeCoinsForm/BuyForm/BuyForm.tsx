import { useMutation } from '@tanstack/react-query';
import { openLink } from '@telegram-apps/sdk-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { SubmitHandler, useForm } from 'react-hook-form';

import Button from '@/components/UI/Button/Button';
import Input from '@/components/UI/Input/Input';
import { SelectInput } from '@/components/UI/Input/SelectInput/SelectInput';
import { PlayButton } from '@/components/UI/PlayButton/PlayButton';

import { CURRENCY_LIST, TPaymentMethod } from '@/lib/configs/Payment.config';
import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';
import { formatter } from '@/lib/helpers/format.helper';
import { ITopUpPayload } from '@/lib/types/services/balance.type';

import SelectPayment from '../SelectPayment/SelectPayment';

import { useRouter } from '@/i18n/routing';
import { BalanceService } from '@/services/balance.service';

import './buyForm.scss';

interface Props {}

interface IBuyForm {
    type: TPaymentMethod;
    selectedCurrency: (typeof CURRENCY_LIST)[0];
    amount: number | null;
}

export function BuyForm({}: Props) {
    const t = useTranslations('BuyForm');
    const router = useRouter();

    const {
        register,
        setValue,
        getValues,
        watch,
        handleSubmit,
        trigger,
        formState: { isValid, errors },
    } = useForm<IBuyForm>({
        mode: 'onChange',
        defaultValues: {
            type: 'crypto',
            selectedCurrency: CURRENCY_LIST[0],
            amount: 0,
        },
    });

    const { mutateAsync, isPending } = useMutation({
        mutationKey: ['top-up-balance'],
        mutationFn: async (payload: ITopUpPayload) => BalanceService.topUpBalance(payload),
    });

    const submit: SubmitHandler<IBuyForm> = async (data) => {
        if (getValues('type') === 'crypto') {
            await mutateAsync(
                {
                    amount: Number(getValues('amount')),
                    method: 'crypto',
                },
                {
                    onSuccess: async (response) => {
                        const { toast } = await import('react-hot-toast');
                        toast.loading('Redirect to the payment page...');

                        openLink(response.result, {
                            tryInstantView: false,
                        });
                    },
                    onError: async (error) => ApiErrorHandler(error, "Couldn't pay with crypt"),
                },
            );
        }
    };

    return (
        <form className="exchange-form buy-form" onSubmit={handleSubmit(submit)}>
            <div className="exchange-form__section buy-form__top">
                <p className="input-with-title__title select-payment__title">{t('Amount')}</p>

                <div className="buy-form__top-wrapper">
                    <Input
                        id="exchange-amount"
                        {...register('amount', {
                            required: true,
                            validate: (value) => {
                                if (watch('type') === 'crypto') {
                                    if (!value || value < 1 || value > 5000) return 'Min:1, Max: 5000';
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

                    <SelectInput
                        data={CURRENCY_LIST}
                        selectedElement={watch('selectedCurrency')}
                        onSelectHandler={(value) => {
                            setValue('selectedCurrency', value);
                        }}
                        blocked={watch('type') === 'crypto'}
                        render={(item) => (
                            <p style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                <Image
                                    src={`/img/currency/exchange/${item.value}.svg`}
                                    width={20}
                                    height={20}
                                    alt={item.value}
                                />
                                {item.name.toUpperCase()}
                            </p>
                        )}
                        preIcon={
                            <Image
                                src={`/img/currency/exchange/${watch('selectedCurrency').value}.svg`}
                                width={20}
                                height={20}
                                alt={watch('selectedCurrency').value}
                            />
                        }
                        displayFn={(item) => ` ${item?.name.toUpperCase()}`}
                    />
                </div>
            </div>

            <div className="exchange-form__section">
                <SelectPayment
                    type="buy"
                    selected={watch('type')}
                    onChange={(payment) => {
                        if (payment.type === 'crypto') {
                            setValue('selectedCurrency', CURRENCY_LIST[0]);
                        }
                        setValue('type', payment.type);
                        trigger('amount');
                    }}
                />
            </div>

            <span className="exchange-form__line" />

            <div className="exchange-form__control">
                <div className="exchange-form__info">
                    <div>
                        <small className="exchange-form__text">{t('Receive')}</small>
                        <p className="exchange-form__total">
                            ~{formatter.format(Math.round(Number(watch('amount')) * 100))}{' '}
                            <Image src={'/img/currency/points.svg'} width={20} height={20} alt="slim" />
                        </p>
                    </div>
                    <p className="exchange-form__commission">
                        {watch('type') === 'crypto' ? t('Commission') : 'Commission - пока думаем...'}
                    </p>
                </div>
                <div className="exchange-form__buttons">
                    <Button variant={'active'} disabled={!isValid} isLoading={isPending}>
                        {t('Buy')}
                    </Button>
                    <PlayButton onClick={() => router.push('https://t.me/slimandrich/52')} />
                </div>
            </div>
        </form>
    );
}
