import { useQuery } from '@tanstack/react-query';

import { BattleService } from '@/services/battle.service';

export const useByMySelfInfo = () => {
    const query = useQuery({
        queryKey: ['get-myself-battle-info'],
        queryFn: async () => BattleService.getByMySelfInfo(),
    });

    return { ...query };
};
