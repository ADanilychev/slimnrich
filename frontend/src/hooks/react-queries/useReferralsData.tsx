import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { UserService } from '@/services/user.service';

export const useReferralsData = () => {
    const query = useQuery({
        queryKey: ['fetch-referrals-data'],
        queryFn: async () => await UserService.getReferralsData(),
        staleTime: 60_000,
    });

    const isBlogger = useMemo(() => {
        return query.data?.promo_code !== null;
    }, [query]);

    return { ...query, isBlogger };
};
