'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Skeleton from 'react-loading-skeleton';

import Button from '@/components/UI/Button/Button';
import InputWithTitle from '@/components/UI/Input/InputWithTitle/InputWithTitle';

import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';
import { formatter } from '@/lib/helpers/format.helper';
import cn from '@/lib/import/classnames';
import { CurrencyTypes } from '@/lib/types/Currency.type';
import { IWalletInfo, IWithdrawForm } from '@/lib/types/services/admin.type';

import { useAdminBasicInfo } from '@/hooks/react-queries/useAdminBasicInfo';
import { AdminService } from '@/services/admin.service';

import '../admin-badge.scss';
import './balanceStatisticsBadge.scss';

export function BalanceStatisticsBadge() {
    const queryClient = useQueryClient();
    const { data, isLoading } = useAdminBasicInfo({});

    const { data: walletsInfo, isLoading: isLoadingWalletsInfo } = useQuery({
        queryKey: ['fetch-wallets-info'],
        queryFn: async () => await AdminService.getWalletsInfo(),
    });

    const {
        setValue,
        register,
        watch,
        trigger,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<IWithdrawForm>({
        mode: 'onChange',
    });

    const { mutateAsync, isPending } = useMutation({
        mutationKey: ['wallet-withdraw'],
        mutationFn: async (payload: IWithdrawForm) => await AdminService.walletWithdraw(payload),
    });

    const changeMethod = (wallet: IWalletInfo) => {
        setValue('method', wallet.method);
        setValue('amount', wallet.balance);

        trigger('amount');
    };

    const onSubmit: SubmitHandler<IWithdrawForm> = async (data) => {
        await mutateAsync(data, {
            onSuccess: async () => {
                queryClient.invalidateQueries({ queryKey: ['fetch-wallets-info'] });

                const { toast } = await import('react-hot-toast');
                toast.success('The operation was completed successfully');

                trigger('amount');
            },
            onError: async (error) => ApiErrorHandler(error, 'Api Error'),
        });
    };

    useEffect(() => {
        if (isLoadingWalletsInfo || !walletsInfo) return;

        setValue('amount', walletsInfo[0]?.balance);
        setValue('method', walletsInfo[0]?.method);

        trigger('amount');
    }, [isLoadingWalletsInfo, walletsInfo]);

    if (isLoading || isLoadingWalletsInfo)
        return <Skeleton className="admin-badge balance-statistics-badge" height={400} />;

    return (
        <div className="admin-badge balance-statistics-badge">
            <div className="admin-badge__header">
                <p className="admin-badge__title">Balance</p>
            </div>
            <div className="admin-badge__content">
                <div className="balance-statistics-badge__top">
                    <h1>Overall balance:</h1>
                    <h2>
                        {formatter.format(data?.total_lost || 0)}{' '}
                        <Image
                            src={`/img/currency/${CurrencyTypes.POINTS}.svg`}
                            height={25}
                            width={25}
                            alt="currency"
                        />
                    </h2>
                </div>

                <form className="balance-statistics-badge__form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="balance-statistics-badge__types">
                        {walletsInfo?.map((wallet) => (
                            <div
                                className={cn('type-item', {
                                    'type-item_selected': watch('method') === wallet.method,
                                })}
                                onClick={() => changeMethod(wallet)}
                                key={wallet.id}
                            >
                                <div className="type-item__left">
                                    <Image
                                        src={`/img/currency/types/${wallet.method}.svg`}
                                        height={30}
                                        width={30}
                                        alt={wallet.method}
                                    />
                                    <p>{wallet.method}</p>
                                </div>
                                <div className="type-item__right">
                                    <p>{wallet.balance}</p>
                                    <Image
                                        src={`/img/currency/${CurrencyTypes.POINTS}.svg`}
                                        height={20}
                                        width={20}
                                        alt="currency"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <InputWithTitle
                        id="amount-input"
                        title={'Enter amount'}
                        type="number"
                        isError={!!errors.amount}
                        showErrorTooltip={true}
                        errorMessage={errors.amount?.message}
                        {...register('amount', {
                            min: 1,
                            validate: (value) => {
                                const max = walletsInfo?.find((w) => w.method === watch('method'))?.balance || 0;
                                return value <= max;
                            },
                            valueAsNumber: true,
                            required: true,
                        })}
                    />

                    <Button variant={'active'} disabled={!isValid} isLoading={isPending} type="submit">
                        Perform operation
                    </Button>
                </form>
            </div>
        </div>
    );
}
