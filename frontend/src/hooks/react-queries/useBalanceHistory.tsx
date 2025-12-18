import { useQuery } from '@tanstack/react-query';

import { IUserHistoryPayload, TBalanceHistoryType } from '@/lib/types/services/user.type';

import { UserService } from '@/services/user.service';

export const useBalanceHistory = (payload: IUserHistoryPayload, type: TBalanceHistoryType = 'all') => {
    const query = useQuery({
        queryKey: ['fetch-balance-history', type],
        queryFn: async () => await UserService.getBalanceHistory(payload),
        staleTime: 60000,
    });

    return { ...query };
};
