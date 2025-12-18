import { useQuery } from '@tanstack/react-query';

import { UserService } from '@/services/user.service';

export const useGetUserBattles = () => {
    const query = useQuery({
        queryKey: ['fetch-user-battles'],
        queryFn: async () => UserService.getUserBattlesData(),
        staleTime: 30_000,
    });

    return { ...query };
};
