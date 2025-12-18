import { BattleType } from '@/lib/configs/Battle.config';

import { JoinBattle } from './JoinBattle';

export default async function Page(props: {
    params: Promise<{ battle_type: BattleType }>;
    searchParams?: Promise<{ createNew: boolean }>;
}) {
    const params = await props.params;

    const { battle_type } = params;

    return <JoinBattle battle_type={battle_type} />;
}
