import { useMemo } from 'react';

import { BattleType } from '@/lib/configs/Battle.config';
import {
    INewGroupForTimeBattleResponse,
    INewGroupWeightBattleResponse,
    INewVSFriendBattleResponse,
    INewVsOtherBattleResponse,
    TBattleResponse,
} from '@/lib/types/services/battles.type';

import { ByMySelfWidget } from './ByMySelfWidget/ByMySelfWidget';
import { GroupForTimeWidget } from './GroupForTimeWidget/GroupForTimeWidget';
import { GroupForWeightWidget } from './GroupForWeightWidget/GroupForWeightWidget';
import { VsFriendWidget } from './VsFriendWidget/VsFriendWidget';
import { VsOtherWidget } from './VsOtherWidget/VsOtherWidget';
import { WithYourGroupWidget } from './WithYourGroupWidget/WithYourGroupWidget';

import './battleStatisticsWidget.scss';

export function BattleStatisticsWidget<T extends BattleType>({
    battle_type,
    entity,
}: {
    battle_type: BattleType;
    entity?: TBattleResponse<T>;
}) {
    const displayWidget = useMemo(() => {
        if (battle_type === BattleType.BY_MYSELF) return <ByMySelfWidget entity={entity} />;
        if (battle_type === BattleType.ONE_ON_ONE_WITH_FRIENDS)
            return <VsFriendWidget entity={entity as INewVSFriendBattleResponse} />;
        if (battle_type === BattleType.ONE_ON_ONE)
            return <VsOtherWidget entity={entity as INewVsOtherBattleResponse} />;
        if (battle_type === BattleType.GROUP_FOR_TIME)
            return <GroupForTimeWidget entity={entity as INewGroupForTimeBattleResponse} />;
        if (battle_type === BattleType.GROUP_BY_WEIGHT)
            return <GroupForWeightWidget entity={entity as INewGroupWeightBattleResponse} />;
        if (battle_type === BattleType.WITH_YOUR_GROUP)
            return <WithYourGroupWidget entity={entity as INewGroupWeightBattleResponse} />;
        return <ByMySelfWidget entity={entity} />;
    }, [battle_type, entity]);

    return <div className="battle-statistics-widget">{displayWidget}</div>;
}
