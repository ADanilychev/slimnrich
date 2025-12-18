'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useMemo, useTransition } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { CustomBattleHeader } from '@/components/CustomBattlePageComponents/CustomBattleHeader/CustomBattleHeader';
import MainLoader from '@/components/MainLoader/MainLoader';
import Button from '@/components/UI/Button/Button';
import InputWithTitle from '@/components/UI/Input/InputWithTitle/InputWithTitle';
import { SelectInput } from '@/components/UI/Input/SelectInput/SelectInput';

import { BattleType } from '@/lib/configs/Battle.config';
import { BATTLE_SLIMS, DURATION_BATTLE } from '@/lib/configs/CreateBattle.config';
import { WEIGHT_SYSTEM } from '@/lib/constants/NumberSystem';
import { BATTLE_PAGE } from '@/lib/constants/Routes';
import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';
import { IByMySelfQuery } from '@/lib/types/services/battles.type';

import { useValidateWeightBase } from '@/hooks/form-validators/useValidateWeightBase';
import { useGetUserBattles } from '@/hooks/react-queries/useGetUserBattles';
import { useTransformNumberSystem } from '@/hooks/useTransformNumberSystem';
import { useRouter } from '@/i18n/routing';
import { BattleService } from '@/services/battle.service';

import './byMyself.scss';

export function ByMyself() {
    const t = useTranslations('CreateBattle.ByMyself');

    const router = useRouter();
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const { data: battlesData, isLoading: isLoadingBattlesData } = useGetUserBattles();
    const { currentNumberSystem, transformToKg } = useTransformNumberSystem();

    const { validateWeightBase } = useValidateWeightBase();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        trigger,
        control,
        formState: { isValid, errors },
    } = useForm<IByMySelfQuery>({
        mode: 'onChange',
        defaultValues: {
            period: DURATION_BATTLE[0],
            amount: Number(searchParams.get('bid')),
        },
    });

    const { mutateAsync, isPending: isPendingCreateBattle } = useMutation({
        mutationKey: ['create-byself-battle'],
        mutationFn: async (payload: IByMySelfQuery) => BattleService.createByMyself(payload),
    });

    const validateGoal = (goal: number) => {
        let result = validateWeightBase(goal, false);

        if (typeof result === 'string') return result;

        const minWeight = minWeightData[watch('period') - 1];

        if (minWeight > goal) return `${t.rich('LessWeight', { minWeight })}`;

        return true;
    };

    const minWeightData = useMemo(() => {
        if (currentNumberSystem.weight === WEIGHT_SYSTEM.KG) return battlesData?.max_kg || [];
        return battlesData?.max_lb || [];
    }, [battlesData, currentNumberSystem]);

    const onSubmit: SubmitHandler<IByMySelfQuery> = async (data) => {
        if (currentNumberSystem.weight !== WEIGHT_SYSTEM.KG) {
            data.goal = Number(transformToKg(data.goal));
        }

        mutateAsync(data, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['get-user-basic-data'] });
                queryClient.invalidateQueries({ queryKey: ['fetch-user-battles'] });
                startTransition(() => {
                    router.push(BATTLE_PAGE.PLAN(BattleType.BY_MYSELF));
                });
            },
            onError: async (error) => {
                await ApiErrorHandler(error, "Couldn't create a battle!");
            },
        });
    };

    if (isLoadingBattlesData) return <MainLoader />;

    return (
        <div className="custom-battle by-myself-battle">
            <CustomBattleHeader title={t('Title')} content={t('SubTitle')} />

            <form className="battle-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="custom-battle__content">
                    <InputWithTitle
                        id="goal-input"
                        title={t('DesiredWeight')}
                        {...register('goal', {
                            required: true,
                            valueAsNumber: true,
                            validate: validateGoal,
                        })}
                        isError={!!errors.goal}
                        showErrorTooltip={true}
                        errorMessage={errors.goal?.message}
                        autoComplete="off"
                        type="number"
                        step={0.01}
                        placeholder={`0 | ${currentNumberSystem.weight}`}
                    />

                    <Controller
                        name="period"
                        control={control}
                        render={({ field }) => (
                            <SelectInput
                                title={t('Deadline')}
                                data={DURATION_BATTLE}
                                selectedElement={watch('period')}
                                onSelectHandler={(value) => {
                                    field.onChange(value);
                                    trigger('goal');
                                }}
                                render={(item) => (
                                    <p style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                        {item} {t('Weeks')}
                                    </p>
                                )}
                                displayFn={(item) => `${item} ${t('Weeks')}`}
                            />
                        )}
                    />

                    <SelectInput
                        title={t('YourBet')}
                        data={BATTLE_SLIMS}
                        selectedElement={watch('amount')}
                        onSelectHandler={(value) => setValue('amount', value)}
                        render={(item) => (
                            <p style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                {item}
                                <Image src={'/img/currency/points.svg'} width={16} height={15} alt="slim img" />
                                {t('Slims')}
                            </p>
                        )}
                        displayFn={(item) => `${item} ${t('Slims')}`}
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
                    <Button variant="transparent" onClick={() => router.back()}>
                        {t('Back')}
                    </Button>
                </div>
            </form>
        </div>
    );
}
