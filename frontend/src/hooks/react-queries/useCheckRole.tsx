import { useQuery } from '@tanstack/react-query';

import { UserService } from '@/services/user.service';

export const useCheckRole = (enabled: boolean = true) => {
    const query = useQuery({
        queryKey: ['check-user-role'],
        queryFn: async () => await UserService.checkUserRole(),
        staleTime: 60_000,
        enabled: enabled,
    });

    return { ...query };
};
