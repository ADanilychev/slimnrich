'use client';

import Skeleton from 'react-loading-skeleton';

import '../badge.scss';
import './achievementsBadge.scss';

export const SkeletonAchievementsBadge = () => {
    return <Skeleton className="badge achievements-badge" height={136} />;
};
