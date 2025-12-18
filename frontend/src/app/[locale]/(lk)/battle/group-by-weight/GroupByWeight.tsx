'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { CustomBattleHeader } from '@/components/CustomBattlePageComponents/CustomBattleHeader/CustomBattleHeader';
import Button from '@/components/UI/Button/Button';
import InputWithTitle from '@/components/UI/Input/InputWithTitle/InputWithTitle';
import { SelectInput } from '@/components/UI/Input/SelectInput/SelectInput';

import { BattleType } from '@/lib/configs/Battle.config';
import { BATTLE_SLIMS } from '@/lib/configs/CreateBattle.config';
import { BATTLE_PAGE } from '@/lib/constants/Routes';
import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';
import { IGroupWeightQuery } from '@/lib/types/services/battles.type';

import { useTransformNumberSystem } from '@/hooks/useTransformNumberSystem';
import { useRouter } from '@/i18n/routing';
import { BattleService } from '@/services/battle.service';

export function GroupByWeight() {
    const t = useTranslations('CreateBattle.GroupByWeight');

    const router = useRouter();
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const [_, startTransition] = useTransition();

    const { transformValueWithNumberSystem } = useTransformNumberSystem();

    const { handleSubmit, watch, control } = useForm<IGroupWeightQuery>({
        mode: 'onChange',
        defaultValues: {
            amount: Number(searchParams.get('bid')),
            goal_size: 0.5,
        },
    });

    const { mutateAsync, isPending } = useMutation({
        mutationKey: ['create-group-weight-battle'],
        mutationFn: async (payload: IGroupWeightQuery) => await BattleService.createGroupWeight(payload),
    });

    const onSubmit: SubmitHandler<IGroupWeightQuery> = async (data) => {
        mutateAsync(data, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['get-user-basic-data'] });
                queryClient.invalidateQueries({ queryKey: ['fetch-user-battles'] });
                startTransition(() => {
                    router.push(BATTLE_PAGE.PLAN(BattleType.GROUP_BY_WEIGHT));
                });
            },
            onError: async (error) => {
                await ApiErrorHandler(error, "Couldn't create a battle!");
            },
        });
    };

    return (
        <div className="custom-battle by-myself-battle">
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

                    <Controller
                        name="goal_size"
                        control={control}
                        render={({ field }) => (
                            <SelectInput
                                title={t('DesiredWeight')}
                                data={[0.5, 1, 1.5, 2]}
                                selectedElement={watch('goal_size')}
                                onSelectHandler={(value) => field.onChange(value)}
                                render={(item) => (
                                    <p style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                        {transformValueWithNumberSystem(item, 'weight')}
                                    </p>
                                )}
                                displayFn={(item) => `${transformValueWithNumberSystem(item, 'weight')}`}
                            />
                        )}
                    />

                    <InputWithTitle
                        title={t('Duration')}
                        placeholder={`1 ${t('Weeks')}`}
                        defaultValue={`1 ${t('Weeks')}`}
                        block
                    />
                </div>

                <div className="custom-battle__footer">
                    <Button type="submit" variant={'active'}>
                        {t('GetPlan')}
                    </Button>
                    <Button variant="transparent" type="button" onClick={() => router.back()}>
                        {t('Back')}
                    </Button>
                </div>
            </form>
        </div>
    );
}
