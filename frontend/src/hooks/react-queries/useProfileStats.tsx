import { useQuery } from '@tanstack/react-query';

import { UserService } from '@/services/user.service';

export const useProfileStats = () => {
    const payload = useQuery({
        queryKey: ['fetch-stats-data'],
        queryFn: async () => await UserService.getStatsData(),
        staleTime: 60000,
    });

    return { ...payload };
};
