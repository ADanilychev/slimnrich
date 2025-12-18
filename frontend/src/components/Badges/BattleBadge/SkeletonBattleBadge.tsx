'use client';

import Skeleton from 'react-loading-skeleton';

const SkeletonBattleBadge = () => {
    return <Skeleton className="badge battle-badge" height={270} style={{ borderRadius: 15 }} />;
};

export default SkeletonBattleBadge;
