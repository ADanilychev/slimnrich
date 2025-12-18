'use client';

import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { LuArrowLeft } from 'react-icons/lu';

import { PlayersInBattleBadge } from '@/components/ADMIN/Badges/PlayersInBattleBadge/PlayersInBattleBadge';
import MainLoader from '@/components/MainLoader/MainLoader';

import { BattleType } from '@/lib/configs/Battle.config';

import { useAdminGetBattleInfo } from '@/hooks/react-queries/battles/useAdminGetBattleInfo';
import { useRouter } from '@/i18n/routing';

import './battleTypeStatistic.scss';

interface Props {
    id: number;
    battle_type: BattleType;
}

export function BattleTypeStatistic({ id, battle_type }: Props) {
    const tBattleConfig = useTranslations('BattleConfig.' + battle_type);

    const router = useRouter();
    const { data, isLoading } = useAdminGetBattleInfo(
        {
            battle_id: id,
            battle_type: battle_type,
        },
        String(id),
    );
    const currentBattle = useMemo(() => {
        return data && data[0];
    }, [data]);

    if (isLoading) return <MainLoader />;

    return (
        <div className="admin-page battle-type-statistic-page">
            <header className="header">
                <div className="header__top">
                    <p className="header__title">{tBattleConfig('Title')}</p>
                    <span onClick={() => router.back()}>
                        <LuArrowLeft />
                        Back
                    </span>
                </div>
                <div className="header__content">
                    <div className="header__content-top">
                        <h2>
                            ID: {currentBattle?.id} - {tBattleConfig('Title')}
                        </h2>
                        <small className="header__content-users">
                            <b>{currentBattle?.participants.length}</b> users
                        </small>
                    </div>
                    <p className="header__content-status">
                        {currentBattle?.status} (end data:{' '}
                        {currentBattle && format(currentBattle.end_timestamp * 1000, 'dd.MM.yyyy')})
                    </p>
                </div>
            </header>

            <PlayersInBattleBadge users={currentBattle?.participants || []} />
        </div>
    );
}
