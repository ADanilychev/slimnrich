import { useQuery } from '@tanstack/react-query';

import { UserService } from '@/services/user.service';

export const useAchievements = () => {
    const data = useQuery({
        queryKey: ['fetch-achievements-badge'],
        queryFn: () => UserService.getAchievements(),
        staleTime: 60000,
    });

    return { ...data };
};
