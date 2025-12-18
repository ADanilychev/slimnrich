'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

import Button from '@/components/UI/Button/Button';
import TabMenu from '@/components/UI/TabMenu/TabMenu';

import TabTopWrapper from '@/hoc/TabTopWrapper/TabTopWrapper';

import { IAchievementData } from '@/lib/types/services/achievement.type';

import AchievementSwiper from './AchievementSwiper/AchievementSwiper';
import { useAchievements } from '@/hooks/react-queries/useAchievements';
import { useTotalAchievement } from '@/hooks/useTotalAchievement';
import { useRouter } from '@/i18n/routing';

import './achievements.scss';

enum EnumFilterType {
    ALL = 'all',
    COMPLETED = 'completed',
    UNFULFILLED = 'Unfulfilled',
}

const Achievements = () => {
    const t = useTranslations('Pages.AchievementsPage');
    const router = useRouter();

    const { data, isLoading } = useAchievements();
    const { totalCompletedCount } = useTotalAchievement(data);

    const [filterType, setFilterType] = useState<EnumFilterType>(EnumFilterType.ALL);

    const filteredData = useMemo(() => {
        if (!data) return data;
        const dataClone: IAchievementData | undefined = JSON.parse(JSON.stringify(data));

        switch (filterType) {
            case EnumFilterType.COMPLETED:
                dataClone?.pages.forEach((p) => (p.available = []));
                break;
            case EnumFilterType.UNFULFILLED:
                dataClone?.pages.forEach((p) => (p.has = []));
                break;
        }
        return dataClone;
    }, [data, filterType]);

    return (
        <div className="achievements-page">
            <TabTopWrapper>
                <h1>{t('Title')}</h1>
                <div className="achievements-page__total">
                    <p>
                        <span>{totalCompletedCount}</span>/{data?.total_count}
                    </p>
                </div>
                <TabMenu
                    className="achievements-page__tabs"
                    activeLink={filterType}
                    links={[
                        {
                            text: t('Tabs.All'),
                            link: () => setFilterType(EnumFilterType.ALL),
                            slug: EnumFilterType.ALL,
                        },
                        {
                            text: t('Tabs.Completed'),
                            link: () => setFilterType(EnumFilterType.COMPLETED),
                            slug: EnumFilterType.COMPLETED,
                        },
                        {
                            text: t('Tabs.Unfulfilled'),
                            link: () => setFilterType(EnumFilterType.UNFULFILLED),
                            slug: EnumFilterType.UNFULFILLED,
                        },
                    ]}
                />
            </TabTopWrapper>
            <div className="main-content">
                {isLoading ? (
                    <Skeleton height={350} className="skeleton-achievement-swiper" />
                ) : (
                    filteredData && <AchievementSwiper achievements={filteredData} />
                )}
                <Button variant={'stroke'} onClick={() => router.back()}>
                    {t('Back')}
                </Button>
            </div>
        </div>
    );
};

export default Achievements;
