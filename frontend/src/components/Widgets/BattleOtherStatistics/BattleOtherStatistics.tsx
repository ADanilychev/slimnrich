import { useTranslations } from 'next-intl';
import { Fragment, useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';

import { BattleConfig, BattleType } from '@/lib/configs/Battle.config';
import { IBattlesDataItem } from '@/lib/types/services/battles.type';

import { OtherStatisticsItem } from './OtherStatisticsItem/OtherStatisticsItem';
import { useGetUserBattles } from '@/hooks/react-queries/useGetUserBattles';

import '../widgets.scss';
import './battleOtherStatistics.scss';

export function BattleOtherStatistics({ currentBattle }: { currentBattle: BattleType }) {
    const t = useTranslations('BattleOtherStatistics');
    const { data, isLoading } = useGetUserBattles();

    const battlesData = useMemo(() => {
        return data?.battles_data || {};
    }, [data]);

    if (isLoading) return <Skeleton height={350} className="base-battle-widget battle-other-statistics" />;

    return (
        <div className="base-battle-widget battle-other-statistics">
            <div className="base-battle-widget__header">
                <p className="base-battle-widget__title">{t('Title')}</p>
            </div>

            <div className="base-battle-widget__content">
                {Object.entries(battlesData).map(([type, data]) => (
                    <Fragment key={type}>
                        {type !== currentBattle && (
                            <OtherStatisticsItem
                                battle={BattleConfig[type as keyof typeof BattleConfig]}
                                entity={data as IBattlesDataItem}
                            />
                        )}
                    </Fragment>
                ))}
            </div>
        </div>
    );
}
