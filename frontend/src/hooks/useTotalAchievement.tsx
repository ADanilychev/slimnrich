import { useMemo } from 'react';

import { IAchievementData } from '@/lib/types/services/achievement.type';

export const useTotalAchievement = (data: IAchievementData | undefined) => {
    const totalCompletedCount = useMemo(() => {
        return data?.pages.reduce((acc, prev) => (acc += prev.has.length), 0);
    }, [data]);

    return { totalCompletedCount };
};
