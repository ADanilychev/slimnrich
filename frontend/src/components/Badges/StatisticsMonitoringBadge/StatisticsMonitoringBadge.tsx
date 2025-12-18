'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { VictoryAxis, VictoryBar, VictoryChart, VictoryTheme } from 'victory';

import TabMenu from '@/components/UI/TabMenu/TabMenu';

import { useProfileStats } from '@/hooks/react-queries/useProfileStats';
import { useTransformNumberSystem } from '@/hooks/useTransformNumberSystem';

import './statisticsMonitoringBadge.scss';

enum TABS {
    WEEKS = 7,
    MONTHS = 30,
    YEARS = 365,
    ALL = 'all',
}

export const StatisticsMonitoringBadge = () => {
    const t = useTranslations('Badges.StatisticsMonitoringBadge');

    const { data, isLoading } = useProfileStats();
    const { transformValueWithNumberSystem } = useTransformNumberSystem();
    const [currentTab, setCurrentTab] = useState(TABS.WEEKS);

    const [yMinMax, setY] = useState<number[]>([]);

    const dataMemo = useMemo(() => {
        return data?.result[currentTab];
    }, [data, currentTab]);

    const filteredDataMemo = useMemo(() => {
        const dataPayload: { x: number; y: number }[] = [];

        const yMinMax = [Math.min(...(dataMemo?.stats ?? [])) - 1, Math.max(...(dataMemo?.stats ?? []))];

        setY(yMinMax);

        dataMemo?.stats.forEach((item, index) => {
            dataPayload.push({ x: index, y: item });
        });

        return dataPayload;
    }, [dataMemo]);

    const tabsMemo = useMemo(() => {
        return [
            {
                text: t('Tabs.Weeks'),
                link: () => setCurrentTab(TABS.WEEKS),
                slug: TABS.WEEKS,
            },
            {
                text: t('Tabs.Months'),
                link: () => setCurrentTab(TABS.MONTHS),
                slug: TABS.MONTHS,
            },
            {
                text: t('Tabs.Year'),
                link: () => setCurrentTab(TABS.YEARS),
                slug: TABS.YEARS,
            },
            {
                text: t('Tabs.AllTimes'),
                link: () => setCurrentTab(TABS.ALL),
                slug: TABS.ALL,
            },
        ];
    }, []);

    if (isLoading) return <Skeleton height={300} />;

    return (
        <div className="badge statistics-monitoring">
            <div className="badge__header statistics-monitoring__filter">
                <TabMenu activeLink={currentTab} links={tabsMemo} />
            </div>
            <div className="badge__content">
                <div className="statistics-monitoring__chart">
                    <VictoryChart theme={VictoryTheme.clean} domain={{ y: [yMinMax[0], yMinMax[1]] }}>
                        <VictoryAxis
                            tickFormat={() => ''}
                            style={{
                                axis: { stroke: 'transparent' }, // Скрывает линию оси X
                                ticks: { stroke: 'transparent' }, // Скрывает деления на оси X
                                tickLabels: { fontSize: 14, fill: '#999999' },
                            }}
                        />
                        <VictoryBar
                            style={{
                                data: {
                                    width: 45,
                                    fill: '#9030F0B2',
                                },
                            }}
                            cornerRadius={10}
                            data={filteredDataMemo}
                            labels={({ datum }) => transformValueWithNumberSystem(datum.y, 'weight')} //transformValueWithNumberSystem(datum.y, 'weight')
                            animate={{
                                duration: 500,
                                onLoad: { duration: 500 },
                            }}
                        />
                    </VictoryChart>
                </div>
                <div className="statistics-monitoring__info">
                    <div className="info-item">
                        <p>{transformValueWithNumberSystem(dataMemo?.current, 'weight')}</p>
                        <small>{t('Current')}</small>
                    </div>
                    <div className="info-item">
                        <p>{transformValueWithNumberSystem(dataMemo?.change, 'weight')}</p>
                        <small>{t('Changes')}</small>
                    </div>
                    <div className="info-item">
                        <p>{transformValueWithNumberSystem(dataMemo?.average, 'weight')}</p>
                        <small>{t('Average')}</small>
                    </div>
                </div>
            </div>
        </div>
    );
};
