import { BattleType } from '@/lib/configs/Battle.config';

import { Plan } from './Plan';

export default async function Page(props: { params: Promise<{ battle_type: BattleType }> }) {
    const params = await props.params;
    const { battle_type } = params;

    return <Plan battle_type={battle_type} />;
}
