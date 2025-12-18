'use client';

import { BattlesBadge } from '@/components/ADMIN/Badges/BattlesBadge/BattlesBadge';
import { BattlesStatisticsBadge } from '@/components/ADMIN/Badges/BattlesStatisticsBadge/BattlesStatisticsBadge';

import { useAdminGetBattleInfo } from '@/hooks/react-queries/battles/useAdminGetBattleInfo';

import './battles.scss';

export function Battles() {
    const { data, isLoading } = useAdminGetBattleInfo({
        battle_id: null,
        battle_type: null,
    });

    return (
        <div className="admin-page admin-battles-page">
            <BattlesStatisticsBadge />
            <BattlesBadge battles={data || []} isLoading={isLoading} />
        </div>
    );
}
