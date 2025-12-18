import { useQuery } from '@tanstack/react-query';

import { AdminService } from '@/services/admin.service';

export const useAdminBasicInfo = (payload: { start_timestamp?: number; end_timestamp?: number }, key?: string) => {
    const query = useQuery({
        queryKey: ['fetch-admin-basic-info', key],
        queryFn: async () => AdminService.getBasicInfo(payload),
        staleTime: 60_000,
    });

    return { ...query };
};
