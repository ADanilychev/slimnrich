'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { CustomBattleHeader } from '@/components/CustomBattlePageComponents/CustomBattleHeader/CustomBattleHeader';
import Button from '@/components/UI/Button/Button';
import InputWithTitle from '@/components/UI/Input/InputWithTitle/InputWithTitle';
import { SelectInput } from '@/components/UI/Input/SelectInput/SelectInput';

import { BattleType } from '@/lib/configs/Battle.config';
import { BATTLE_SLIMS } from '@/lib/configs/CreateBattle.config';
import { BATTLE_PAGE } from '@/lib/constants/Routes';
import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';
import { IVSQuery } from '@/lib/types/services/battles.type';

import { useRouter } from '@/i18n/routing';
import { BattleService } from '@/services/battle.service';

export function OneOnOne() {
    const t = useTranslations('CreateBattle.OneOnOne');

    const router = useRouter();
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const {
        handleSubmit,
        watch,
        control,
        formState: { isValid },
    } = useForm<IVSQuery>({
        mode: 'onChange',
        defaultValues: {
            amount: Number(searchParams.get('bid')),
        },
    });

    const { mutateAsync, isPending: isPendingCreateBattle } = useMutation({
        mutationKey: ['create-vsother-battle'],
        mutationFn: async (payload: IVSQuery) => BattleService.createVSOther(payload),
    });

    const onSubmit: SubmitHandler<IVSQuery> = async (data) => {
        mutateAsync(data, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['get-user-basic-data'] });
                queryClient.invalidateQueries({ queryKey: ['fetch-user-battles'] });
                startTransition(() => {
                    router.push(BATTLE_PAGE.PLAN(BattleType.ONE_ON_ONE));
                });
            },
            onError: async (error) => {
                await ApiErrorHandler(error, "Couldn't create a battle!");
            },
        });
    };

    return (
        <div className="custom-battle one-on-one">
            <CustomBattleHeader title={t('Title')} content={t('SubTitle')} subTitle={t('Description')} />
            <form className="battle-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="custom-battle__content">
                    <Controller
                        name="amount"
                        control={control}
                        render={({ field }) => (
                            <SelectInput
                                title={t('YourBet')}
                                data={BATTLE_SLIMS}
                                selectedElement={watch('amount')}
                                onSelectHandler={(value) => field.onChange(value)}
                                render={(item) => (
                                    <p style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                        {item}
                                        <Image src={'/img/currency/points.svg'} width={16} height={15} alt="slim img" />
                                        {t('Slims')}
                                    </p>
                                )}
                                displayFn={(item) => `${item} ${t('Slims')}`}
                            />
                        )}
                    />

                    <InputWithTitle
                        title={t('Duration')}
                        placeholder={`2 ${t('Weeks')}`}
                        defaultValue={`2 ${t('Weeks')}`}
                        block
                    />
                </div>
                <div className="custom-battle__footer">
                    <Button
                        variant={'active'}
                        type="submit"
                        disabled={!isValid}
                        isLoading={isPendingCreateBattle || isPending}
                    >
                        {t('Pay')}
                    </Button>
                    <Button variant="transparent" type="button" onClick={() => router.back()}>
                        {t('Back')}
                    </Button>
                </div>
            </form>
        </div>
    );
}
