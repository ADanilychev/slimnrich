'use client';

import dynamic from 'next/dynamic';

import { AchievementsBadge } from '@/components/Badges/AchievementsBadge/AchievementsBadge';
import SkeletonBattleBadge from '@/components/Badges/BattleBadge/SkeletonBattleBadge';
import { StatisticTopInfo } from '@/components/StatisticTopInfo/StatisticTopInfo';

import './statisticsPage.scss';

const BattleBadgeLazy = dynamic(() => import('@/components/Badges/BattleBadge/BattleBadge'), {
    loading: () => <SkeletonBattleBadge />,
});

const StatisticsMonitoringBadgeDynamic = dynamic(
    () =>
        import('@/components/Badges/StatisticsMonitoringBadge/StatisticsMonitoringBadge').then(
            (mod) => mod.StatisticsMonitoringBadge,
        ),
    {
        loading: () => <SkeletonBattleBadge />,
        ssr: false,
    },
);

const StatisticsPage = () => {
    return (
        <div className="statistics-page">
            <StatisticTopInfo />

            <div className="main-content">
                <BattleBadgeLazy />
                <StatisticsMonitoringBadgeDynamic />
                <AchievementsBadge />
            </div>
        </div>
    );
};

export default StatisticsPage;
