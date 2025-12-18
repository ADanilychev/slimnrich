import { useQuery } from '@tanstack/react-query';

import { IGetBattleFilter } from '@/lib/types/services/admin.type';

import { AdminService } from '@/services/admin.service';

export const useAdminGetBattleInfo = (filter: IGetBattleFilter, queryKey = 'all') => {
    const query = useQuery({
        queryKey: ['admin-battle-info', queryKey],
        queryFn: () => AdminService.getBattles(filter),
        staleTime: 1000 * 60, // 1 minutes
    });

    return { ...query };
};
