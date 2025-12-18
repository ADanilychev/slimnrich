'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import Skeleton from 'react-loading-skeleton';

import MainLoader from '@/components/MainLoader/MainLoader';
import BaseHint from '@/components/UI/BaseHint/BaseHint';
import Button from '@/components/UI/Button/Button';

import TabTopWrapper from '@/hoc/TabTopWrapper/TabTopWrapper';

import { BattleType } from '@/lib/configs/Battle.config';
import { BATTLE_PAGE, ROUTES } from '@/lib/constants/Routes';

import { useGetBattleInfo } from '@/hooks/react-queries/battles/useGetBattleInfo';
import { useProfile } from '@/hooks/react-queries/useProfile';
import { useTransformNumberSystem } from '@/hooks/useTransformNumberSystem';
import { useRouter } from '@/i18n/routing';
import { BattleService } from '@/services/battle.service';

import './plan.scss';

const PlanGraphDynamic = dynamic(() => import('@/components/PlanGraph/PlanGraph').then((mod) => mod.PlanGraph), {
    ssr: false,
    loading: () => <Skeleton height={220} />,
});

export function Plan({ battle_type }: { battle_type: BattleType }) {
    const t = useTranslations('Pages.PlanPage');

    const router = useRouter();

    const { data: profileData, isFetching: isLoadingProfileData } = useProfile();
    const { data: battleInfo, isFetching: isLoadingBattleInfo } = useGetBattleInfo(battle_type);
    const { transformValueWithNumberSystem } = useTransformNumberSystem();

    const { data: battlePlan, isLoading: isLoadingBattlePlan } = useQuery({
        queryKey: ['get-battle-plan'],
        queryFn: async () =>
            await BattleService.getBattlePlan({
                start_weight: profileData?.weight_kg || 0,
                final_weight: finalWeightData(),
                period: battleInfo?.money_progress.length || 2,
                battle_type: battle_type,
            }),
        enabled: !isLoadingBattleInfo && !isLoadingProfileData,
    });

    const finalWeightData = () => {
        if (battle_type && (battle_type === BattleType.BY_MYSELF || battle_type === BattleType.GROUP_BY_WEIGHT)) {
            return (profileData?.weight_kg || 0) - (battleInfo?.goal || 0);
        }

        return null;
    };

    if (isLoadingBattleInfo || isLoadingBattlePlan) return <MainLoader />;

    return (
        <div className="battle-plan myself-plan">
            <TabTopWrapper>
                <h1>{t('Title')}</h1>
            </TabTopWrapper>

            <div className="battle-plan__content">
                <PlanGraphDynamic graphColor="#DDDDFF" data={battlePlan?.graph || []} />
            </div>

            <BaseHint type="success" className="battle-plan__hint">
                <div>
                    {t.rich('YouReceive', {
                        p: (chunks) => <p>{chunks}</p>,
                        b: (chunks) => <b>{chunks}</b>,
                        amount: battlePlan?.amount,
                        goal: transformValueWithNumberSystem(battlePlan?.goal, 'weight'),
                        period: battlePlan?.period,
                    })}
                </div>
            </BaseHint>

            <div className="battle-plan__footer">
                {(battle_type === BattleType.BY_MYSELF ||
                    battle_type === BattleType.ONE_ON_ONE ||
                    battle_type === BattleType.GROUP_BY_WEIGHT ||
                    battle_type === BattleType.GROUP_FOR_TIME) && (
                    <Button variant="active" onClick={() => router.push(ROUTES.BATTLE_STATISTICS(battle_type))}>
                        {t('Next')}
                    </Button>
                )}

                {(battle_type === BattleType.ONE_ON_ONE_WITH_FRIENDS || battle_type === BattleType.WITH_YOUR_GROUP) && (
                    <Button variant="active" onClick={() => router.push(BATTLE_PAGE.JOIN_IN_BATTLE(battle_type))}>
                        {t('Create')}
                    </Button>
                )}
            </div>
        </div>
    );
}
