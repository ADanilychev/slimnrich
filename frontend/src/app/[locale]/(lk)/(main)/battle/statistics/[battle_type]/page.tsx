import type { Metadata } from 'next';

import { BattleType } from '@/lib/configs/Battle.config';

import { BattleStatisticsPage } from './BattleStatisticsPage';

export const metadata: Metadata = {
    title: '',
    description: '',
};

export default async function Page(props: { params: Promise<{ battle_type: BattleType }> }) {
    const params = await props.params;

    const { battle_type } = params;

    return <BattleStatisticsPage battle_type={battle_type} />;
}
