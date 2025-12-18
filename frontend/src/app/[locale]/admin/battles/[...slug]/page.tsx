import { NextPage } from 'next';

import { BattleType } from '@/lib/configs/Battle.config';

import { BattleTypeStatistic } from './BattleTypeStatistic';

interface Props {
    params: Promise<{ slug: string[] }>;
}

const Page: NextPage<Props> = async (props: Props) => {
    const params = await props.params;

    const { slug } = params;

    return <BattleTypeStatistic id={Number(slug[1])} battle_type={slug[0] as BattleType} />;
};

export default Page;
