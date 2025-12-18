'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { ROUTES } from '@/lib/constants/Routes';
import cn from '@/lib/import/classnames';

import { SkeletonAchievementsBadge } from './SkeletonAchievementsBadge';
import { useAchievements } from '@/hooks/react-queries/useAchievements';
import { useTotalAchievement } from '@/hooks/useTotalAchievement';
import { Link } from '@/i18n/routing';

import '../badge.scss';
import './achievementsBadge.scss';

export const AchievementsBadge = () => {
    const t = useTranslations('Badges.AchievementsBadge');
    const { data, isLoading } = useAchievements();
    const { totalCompletedCount } = useTotalAchievement(data);

    if (isLoading) return <SkeletonAchievementsBadge />;

    return (
        <div className="badge achievements-badge">
            <div className="badge__header achievements-badge__top">
                <p className="badge__title">{t('Title')}</p>
                <p className="badge__score">
                    <span>{totalCompletedCount}</span> / {data?.total_count}
                </p>

                <Link href={ROUTES.ACHIEVEMENTS}>{t('TitleLink')}</Link>
            </div>
            <div className="badge__content achievements-badge__content">
                {data?.pre_page.map((achievement, index) => (
                    <div
                        className={cn('achievement-item-badge', {
                            lock: !achievement.has_achievement,
                        })}
                        key={index}
                    >
                        <Image src={achievement.favicon} height={50} width={50} alt={achievement.title} />
                    </div>
                ))}
            </div>
        </div>
    );
};
