'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { SubmitHandler, useForm } from 'react-hook-form';

import Button from '@/components/UI/Button/Button';
import Input from '@/components/UI/Input/Input';

import { BattleType } from '@/lib/configs/Battle.config';
import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';

import { BattleService } from '@/services/battle.service';

import '../badge.scss';
import './joinBattleCodeBadge.scss';

interface ICodeForm {
    code: string | null;
}

export function JoinBattleCodeBadge({ battle_type }: { battle_type: BattleType }) {
    const queryClient = useQueryClient();
    const t = useTranslations('Badges.JoinBattleCodeBadge');

    const {
        register,
        handleSubmit,
        getValues,
        formState: { isValid },
    } = useForm<ICodeForm>({
        mode: 'onChange',
        defaultValues: {
            code: null,
        },
    });

    const { refetch: refetchVsFriend } = useQuery({
        queryKey: ['pre-join-vs-friend'],
        queryFn: async () => await BattleService.preJoinVSFriend(getValues('code') as string),
        enabled: false,
        retry: false,
    });

    const { refetch: refetchWithGroup } = useQuery({
        queryKey: ['pre-with-your-group'],
        queryFn: async () => await BattleService.preWithYourGroup(getValues('code') as string),
        enabled: false,
        retry: false,
    });

    const onSubmit: SubmitHandler<ICodeForm> = () => {
        if (battle_type === BattleType.ONE_ON_ONE_WITH_FRIENDS) {
            refetchVsFriend().then(async (response) => {
                if (response.isSuccess) {
                    queryClient.setQueryData(['get-battle-info', battle_type], () => response.data);
                }

                if (response.isError) {
                    await ApiErrorHandler(response, t('Error'));
                }
            });
        }

        if (battle_type === BattleType.WITH_YOUR_GROUP) {
            refetchWithGroup().then(async (response) => {
                if (response.isSuccess) {
                    queryClient.setQueryData(['get-battle-info', battle_type], () => response.data);
                }

                if (response.isError) {
                    await ApiErrorHandler(response, t('Error'));
                }
            });
        }
    };

    return (
        <div className="badge join-battle-code-badge">
            <div className="badge__header">{t('Title')}</div>
            <div className="badge__content">
                <p className="join-battle-code-badge__title">{t('Description')}</p>
                <form className="join-battle-code-badge__row" onSubmit={handleSubmit(onSubmit)}>
                    <Input placeholder="07443АF" {...register('code', { required: true, minLength: 6 })} />
                    <Button variant={'active'} disabled={!isValid} type="submit">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_1115_13336)">
                                <path
                                    d="M8.33872 16.6749C10.2619 16.6774 12.1264 16.012 13.6134 14.7924L18.5872 19.7653C18.9184 20.0852 19.4461 20.076 19.766 19.7448C20.078 19.4217 20.078 18.9095 19.766 18.5864L14.7931 13.6128C17.7062 10.0472 17.1773 4.79517 13.6118 1.88203C10.0462 -1.0311 4.79419 -0.502205 1.88106 3.06335C-1.03207 6.6289 -0.503181 11.8809 3.06237 14.7941C4.55159 16.0108 6.41565 16.6752 8.33872 16.6749Z"
                                    fill="white"
                                />
                            </g>
                            <defs>
                                <clipPath id="clip0_1115_13336">
                                    <rect width="20" height="20" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                    </Button>
                </form>
            </div>
        </div>
    );
}
