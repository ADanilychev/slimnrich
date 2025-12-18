import { useQuery } from '@tanstack/react-query';

import { UserService } from '@/services/user.service';

export const useAdmin = () => {
    const isAdminData = useQuery({
        queryKey: ['check-user-admin-data'],
        queryFn: async () => await UserService.checkAdmin(),
        staleTime: 300000, // 5 минут
    });

    return isAdminData;
};
