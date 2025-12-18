'use client';

import { useEffect } from 'react';

import { GoalForWeekBadge } from '@/components/Badges/GoalForWeekBadge/GoalForWeekBadge';
import { PlayersInBattle } from '@/components/Badges/PlayersInBattle/PlayersInBattle';
import MainLoader from '@/components/MainLoader/MainLoader';
import { BattleOtherStatistics } from '@/components/Widgets/BattleOtherStatistics/BattleOtherStatistics';
import { BattleStatistics } from '@/components/Widgets/BattleStatistics/BattleStatistics';
import { BattleStatisticsWidget } from '@/components/Widgets/BattleStatisticsWidget/BattleStatisticsWidget';
import { MoneyReceivedWidget } from '@/components/Widgets/MoneyReceivedWidget/MoneyReceivedWidget';

import { useModal } from '@/context/useModalContext';

import { BattleType } from '@/lib/configs/Battle.config';
import { PopupTypes } from '@/lib/types/ModalContext.type';
import { BattleStatusEnum, INewGroupForTimeBattleResponse } from '@/lib/types/services/battles.type';

import { useGetBattleInfo } from '@/hooks/react-queries/battles/useGetBattleInfo';

import './battleStatisticsPage.scss';

export function BattleStatisticsPage({ battle_type }: { battle_type: BattleType }) {
    const { togglePopup } = useModal();
    const { data: battle, isLoading: isLoadingBattle } = useGetBattleInfo(battle_type);

    useEffect(() => {
        if (isLoadingBattle || !battle) return;

        if (battle.alerts.includes('motivation')) {
            togglePopup(true, PopupTypes.BattleMotivation);
        }

        if (battle.alerts.includes('charity')) {
            togglePopup(true, PopupTypes.BattleCharity);
        }
    }, [battle, isLoadingBattle]);

    if (isLoadingBattle) return <MainLoader />;

    return (
        <div className="battle-statistics-page">
            <BattleStatisticsWidget battle_type={battle_type} entity={battle} />

            <div className="main-content">
                {(battle_type === BattleType.GROUP_FOR_TIME ||
                    battle_type === BattleType.GROUP_BY_WEIGHT ||
                    battle_type === BattleType.WITH_YOUR_GROUP) &&
                    (battle as INewGroupForTimeBattleResponse).participants.length > 0 && (
                        <PlayersInBattle players={(battle as INewGroupForTimeBattleResponse).participants} />
                    )}

                {battle?.status !== BattleStatusEnum.NEW && battle?.status !== BattleStatusEnum.WAITING && (
                    <BattleStatistics goal={battle?.goal || 0} reached={battle?.reached || 0} />
                )}

                {battle?.status !== BattleStatusEnum.NEW && battle?.status !== BattleStatusEnum.WAITING && (
                    <GoalForWeekBadge
                        startDate={new Date((battle as INewGroupForTimeBattleResponse).start_timestamp * 1000 || 0)}
                        endDate={new Date((battle as INewGroupForTimeBattleResponse).end_timestamp * 1000 || 0)}
                        resultList={(battle as INewGroupForTimeBattleResponse).results || []}
                    />
                )}

                {battle?.status !== BattleStatusEnum.NEW && battle?.status !== BattleStatusEnum.WAITING && (
                    <MoneyReceivedWidget payload={battle?.money_progress || []} />
                )}

                <BattleOtherStatistics currentBattle={battle_type} />
            </div>
        </div>
    );
}
