import { useQuery } from '@tanstack/react-query';

import { BattleType } from '@/lib/configs/Battle.config';
import { TBattleResponse } from '@/lib/types/services/battles.type';

import { BattleService } from '@/services/battle.service';

export const useGetBattleInfo = <T extends BattleType>(battle_type: T) => {
    const query = useQuery<TBattleResponse<T>>({
        queryKey: ['get-battle-info', battle_type],
        queryFn: async () => {
            const response = await BattleService.getBattleInfo(battle_type);
            return response as TBattleResponse<T>;
        },
    });

    return { ...query };
};
