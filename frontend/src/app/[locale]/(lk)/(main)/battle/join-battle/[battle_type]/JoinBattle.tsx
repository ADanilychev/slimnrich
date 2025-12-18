'use client';

import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

import MainLoader from '@/components/MainLoader/MainLoader';

import TabTopWrapper from '@/hoc/TabTopWrapper/TabTopWrapper';

import { BattleType } from '@/lib/configs/Battle.config';
import {
    BattleStatusEnum,
    INewVSFriendBattleResponse,
    INewWithYourGroupBattleResponse,
} from '@/lib/types/services/battles.type';

import { useGetBattleInfo } from '@/hooks/react-queries/battles/useGetBattleInfo';

import './joinBattle.scss';

const JoinBattleCodeBadgeDynamic = dynamic(() =>
    import('@/components/Badges/JoinBattleCodeBadge/JoinBattleCodeBadge').then((mod) => mod.JoinBattleCodeBadge),
);

const OneOnOneWithFriendWidgetDynamic = dynamic(() =>
    import('@/components/Widgets/OneOnOneWithFriendWidget/OneOnOneWithFriendWidget').then(
        (mod) => mod.OneOnOneWithFriendWidget,
    ),
);

const TournamentGridWidgetDynamic = dynamic(() =>
    import('@/components/Widgets/TournamentGridWidget/TournamentGridWidget').then((mod) => mod.TournamentGridWidget),
);

export function JoinBattle({ battle_type }: { battle_type: BattleType }) {
    const t = useTranslations('Pages.JoinBattle');
    const { data: battleInfo, isFetching } = useGetBattleInfo(battle_type);

    const isOwner = (battleInfo as INewVSFriendBattleResponse)?.is_owner;

    const isBattleEnd = () => {
        if ((battleInfo as INewVSFriendBattleResponse).end_timestamp * 1000 < Date.now()) return true;

        if (battleInfo?.status === BattleStatusEnum.WON || battleInfo?.status === BattleStatusEnum.LOST) return true;

        return false;
    };

    if (isFetching) return <MainLoader />;

    return (
        <div className="join-battle-page">
            <TabTopWrapper>
                <h1>{isOwner ? t('TitleCustom') : t('TitleFriend')}</h1>
                <p>{t('SubTitle')}</p>
            </TabTopWrapper>

            <div className="main-content">
                {isBattleEnd() && <JoinBattleCodeBadgeDynamic battle_type={battle_type} />}
                {!isBattleEnd() && battle_type === BattleType.ONE_ON_ONE_WITH_FRIENDS && (
                    <OneOnOneWithFriendWidgetDynamic
                        battleInfo={battleInfo as INewVSFriendBattleResponse}
                        battle_type={battle_type}
                    />
                )}
                {!isBattleEnd() && battle_type === BattleType.WITH_YOUR_GROUP && (
                    <TournamentGridWidgetDynamic
                        battleInfo={battleInfo as INewWithYourGroupBattleResponse}
                        battle_type={battle_type}
                    />
                )}
            </div>
        </div>
    );
}
