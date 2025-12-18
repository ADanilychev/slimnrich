'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistance } from 'date-fns';
import { enGB } from 'date-fns/locale';
import { useTranslations } from 'next-intl';
import { useMemo, useTransition } from 'react';

import { SendBattleCodeBadge } from '@/components/Badges/SendBattleCodeBadge/SendBattleCodeBadge';
import BaseHint from '@/components/UI/BaseHint/BaseHint';
import Button from '@/components/UI/Button/Button';

import { useModal } from '@/context/useModalContext';

import { BattleType } from '@/lib/configs/Battle.config';
import { ROUTES } from '@/lib/constants/Routes';
import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';
import { PopupTypes } from '@/lib/types/ModalContext.type';
import { IBattleParticipant, INewWithYourGroupBattleResponse } from '@/lib/types/services/battles.type';

import { UserEntity } from '../UserEntity/UserEntity';

import { GridItem } from './GridItem/GridItem';
import { useProfile } from '@/hooks/react-queries/useProfile';
import { useRouter } from '@/i18n/routing';
import { BattleService } from '@/services/battle.service';

import '../widgets.scss';
import './tournamentGridWidget.scss';

export function TournamentGridWidget({
    battleInfo,
    battle_type,
}: {
    battleInfo: INewWithYourGroupBattleResponse;
    battle_type: BattleType;
}) {
    const t = useTranslations('TournamentGridWidget');

    const router = useRouter();
    const { togglePopup } = useModal();
    const queryClient = useQueryClient();
    const { data: profileData } = useProfile();

    const [isPending, startTransition] = useTransition();

    const meData = useMemo(() => {
        let response: IBattleParticipant | undefined;
        response = battleInfo.participants.findLast((p) => p.its_you);

        if (!response) {
            response = {
                name: profileData?.name || '',
                avatar: profileData?.avatar || '',
                user_id: profileData?.user_id || 0,
                achievements_count: profileData?.achievements_count || 0,
                weight_kg: profileData?.weight_kg || 0,
                its_you: true,
            };
        }

        return response;
    }, [battleInfo]);

    const formatTime = () => {
        return formatDistance(battleInfo.start_timestamp * 1000, Date.now(), {
            addSuffix: true,
            locale: enGB,
            includeSeconds: true,
        });
    };

    const participantList: (IBattleParticipant | null)[] = useMemo(() => {
        return [...battleInfo.participants, ...Array(20 - battleInfo.participants.length).fill(null)];
    }, [battleInfo]);

    const { mutateAsync, isPending: isPendingJoin } = useMutation({
        mutationKey: ['fetch-join-with-your-group-battle'],
        mutationFn: async (code: string) => await BattleService.joinWithYourGroup(code),
    });

    const { mutateAsync: startBattleMutateAsync, isPending: isStartPending } = useMutation({
        mutationKey: ['start-with-group-battle'],
        mutationFn: async ({}: any) => BattleService.startWithYourGroup(),
    });

    const payHandler = async () => {
        if ((profileData?.balance || 0) < battleInfo.amount) {
            togglePopup(true, PopupTypes.NotEnoughMoney);

            return;
        }

        await mutateAsync(battleInfo.battle_code, {
            onSuccess: () => {
                queryClient.invalidateQueries();
            },
            onError: async (error) => await ApiErrorHandler(error),
        });
    };

    const startBattle = async () => {
        await startBattleMutateAsync(
            {},
            {
                onSuccess: () => {
                    queryClient.invalidateQueries();
                    startTransition(() => {
                        router.push(ROUTES.BATTLE_STATISTICS(battle_type));
                    });
                },
                onError: async (error) => await ApiErrorHandler(error),
            },
        );
    };

    return (
        <div className="base-battle-widget tournament-grid--widget">
            <div className="base-battle-widget__header">
                <p className="base-battle-widget__title">{t('Title')}</p>
                <p className="base-battle-widget__more">
                    {t('Time')}: {formatTime()}
                </p>
            </div>
            <div className="base-battle-widget__content">
                <div className="tournament-grid--widget__wrapper">
                    <div className="tournament-grid--widget__you">
                        <UserEntity
                            direction="row-reverse"
                            text={t('YourWeight')}
                            avatarSrc={meData?.avatar}
                            achievementCount={meData?.achievements_count}
                            weight_kg={meData?.weight_kg || 0}
                            isUnknown={!!!meData}
                        />

                        <div className="tournament-grid--widget__info">
                            <div className="tournament-grid--widget__row">
                                <p>
                                    {t.rich('Bid', {
                                        b: (chunks) => <b>{chunks}</b>,
                                        amount: battleInfo.amount,
                                    })}
                                </p>
                            </div>
                            <div className="tournament-grid--widget__row">
                                <p>
                                    {t.rich('Duration', {
                                        b: (chunks) => <b>{chunks}</b>,
                                        weeks: battleInfo.money_progress.length,
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="tournament-grid--widget__grid">
                        {participantList.map((p, index) => (
                            <GridItem key={index} user={p} />
                        ))}
                    </div>
                    <div className="tournament-grid--widget__row">
                        <p>
                            {t.rich('YouBet', {
                                b: (chunks) => <b>{chunks}</b>,
                                amount: battleInfo.amount,
                            })}
                        </p>
                    </div>
                    <div className="tournament-grid--widget__row">
                        <p>
                            {t.rich('DurationBattle', {
                                b: (chunks) => <b>{chunks}</b>,
                                weeks: battleInfo.money_progress.length,
                            })}
                        </p>
                    </div>

                    {battleInfo.is_owner && <p className="tournament-grid--widget__hint">{t('Hint')}</p>}
                </div>
                <div className="base-battle-widget__controls">
                    {!battleInfo?.is_owner && !battleInfo.is_accepted && (
                        <>
                            <Button variant={'active'} onClick={payHandler} isLoading={isPending || isPendingJoin}>
                                {t('Pay')}
                            </Button>
                            <Button variant={'stroke'} onClick={() => router.push(ROUTES.BATTLE)}>
                                {t('Reject')}
                            </Button>
                        </>
                    )}

                    {!battleInfo?.is_owner && battleInfo.is_accepted && (
                        <BaseHint type={'success'}>
                            <p>{t('SuccessAccept')}</p>
                        </BaseHint>
                    )}

                    {battleInfo.is_owner && (
                        <>
                            <SendBattleCodeBadge code={battleInfo.battle_code} />
                            <Button variant={'active'} onClick={startBattle} isLoading={isStartPending}>
                                {t('Start')}
                            </Button>
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
