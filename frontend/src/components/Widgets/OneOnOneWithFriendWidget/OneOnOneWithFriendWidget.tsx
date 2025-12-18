'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistance } from 'date-fns';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useTransition } from 'react';

import { SendBattleCodeBadge } from '@/components/Badges/SendBattleCodeBadge/SendBattleCodeBadge';
import Button from '@/components/UI/Button/Button';

import { useModal } from '@/context/useModalContext';

import { BattleType } from '@/lib/configs/Battle.config';
import { ROUTES } from '@/lib/constants/Routes';
import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';
import { PopupTypes } from '@/lib/types/ModalContext.type';
import { INewVSFriendBattleResponse } from '@/lib/types/services/battles.type';

import { UserEntity } from '../UserEntity/UserEntity';

import { useProfile } from '@/hooks/react-queries/useProfile';
import { useRouter } from '@/i18n/routing';
import { BattleService } from '@/services/battle.service';

import '../widgets.scss';
import './OneOnOneWithFriendWidget.scss';

export function OneOnOneWithFriendWidget({
    battleInfo,
    battle_type,
}: {
    battleInfo: INewVSFriendBattleResponse;
    battle_type: BattleType;
}) {
    const t = useTranslations('OneOnOneWithFriendWidget');

    const locale = useLocale();

    const router = useRouter();
    const { togglePopup } = useModal();
    const queryClient = useQueryClient();
    const { data: profileData } = useProfile();

    const [isPending, startTransition] = useTransition();

    const meData = useMemo(() => {
        return battleInfo.participants.findLast((p) => p.its_you);
    }, [battleInfo]);

    const friendData = useMemo(() => {
        return battleInfo.participants.findLast((p) => !p.its_you);
    }, [battleInfo]);

    const { mutateAsync, isPending: isPendingJoin } = useMutation({
        mutationKey: ['fetch-join-vs-friend-battle'],
        mutationFn: async (code: string) => await BattleService.joinVSFriend(code),
    });

    const payHandler = () => {
        if ((profileData?.balance || 0) < battleInfo.amount) {
            togglePopup(true, PopupTypes.NotEnoughMoney);

            return;
        }

        mutateAsync(battleInfo.battle_code, {
            onSuccess: () => {
                startTransition(() => {
                    router.push(ROUTES.BATTLE_STATISTICS(battle_type));
                });
                queryClient.invalidateQueries({ queryKey: ['get-user-basic-data'] });
            },
            onError: async (error) => await ApiErrorHandler(error),
        });
    };

    const formatTime = () => {
        return formatDistance(battleInfo.start_timestamp * 1000, Date.now(), {
            addSuffix: true,
            locale: require('date-fns/locale')[locale],
            includeSeconds: true,
        });
    };

    return (
        <div className="base-battle-widget one-on-one-with-friend-widget">
            <div className="base-battle-widget__header">
                <p className="base-battle-widget__title">{t('Title')}</p>
                <p className="base-battle-widget__more">
                    {t('Time')}: {formatTime()}
                </p>
            </div>
            <div className="base-battle-widget__content">
                <div className="one-on-one-with-friend-widget__top">
                    <UserEntity
                        text={t('YourWeight')}
                        weight_kg={meData?.weight_kg || 0}
                        achievementCount={meData?.achievements_count}
                        avatarSrc={meData?.avatar}
                        isUnknown={!!!meData}
                    />
                    <p className="one-on-one-with-friend-widget__vs">VS</p>
                    <UserEntity
                        direction="row-reverse"
                        text={t('FriendWeight')}
                        avatarSrc={friendData?.avatar}
                        achievementCount={friendData?.achievements_count}
                        weight_kg={friendData?.weight_kg || 0}
                        isUnknown={!!!friendData}
                        goToProfile={
                            !!friendData ? () => router.push(ROUTES.USER(friendData?.user_id || 0)) : undefined
                        }
                    />
                </div>
                <div className="one-on-one-with-friend-widget__row">
                    <p>
                        {t.rich('Bet', {
                            b: (chunks) => <b>{chunks}</b>,
                            amount: battleInfo.amount,
                        })}
                    </p>
                </div>
                <div className="one-on-one-with-friend-widget__row">
                    <p>
                        {t.rich('Duration', {
                            b: (chunks) => <b>{chunks}</b>,
                            weeks: battleInfo.money_progress.length,
                        })}
                    </p>
                </div>

                <div className="base-battle-widget__controls">
                    {!battleInfo?.is_owner && (
                        <>
                            <Button variant={'active'} onClick={payHandler} isLoading={isPending || isPendingJoin}>
                                {t('Pay')}
                            </Button>
                            <Button variant={'stroke'} onClick={() => router.push(ROUTES.BATTLE)}>
                                {t('Reject')}
                            </Button>
                        </>
                    )}

                    {battleInfo.is_owner && (
                        <>
                            <SendBattleCodeBadge code={battleInfo.battle_code} />
                            <Button
                                id="cancelBattle"
                                variant="transparent"
                                onClick={() => togglePopup(true, PopupTypes.CancelBattle, battle_type)}
                            >
                                {t('Cancel')}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
