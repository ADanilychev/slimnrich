import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { WEIGHT_SYSTEM } from '@/lib/constants/NumberSystem';

import { useTransformNumberSystem } from '@/hooks/useTransformNumberSystem';

import './progress.scss';

export function Progress({ goal, reached }: { goal: number; reached: number }) {
    const t = useTranslations('BattleStatistics');

    const { transformValueWithNumberSystem, currentNumberSystem, transformToIb } = useTransformNumberSystem();

    const lineBarFillWidth = useMemo(() => {
        if (reached < 0) return 0;
        return (reached * 100) / goal;
    }, [reached, goal]);

    const displayReachValue = useMemo(() => {
        if (currentNumberSystem.weight === WEIGHT_SYSTEM.IB) return transformToIb(reached);
        else return reached;
    }, [reached, currentNumberSystem]);

    return (
        <div className="battle-statistics-progress">
            <div className="battle-statistics-progress__top">
                <p>
                    <span>{displayReachValue}</span> {t('OutOf')} {transformValueWithNumberSystem(goal, 'weight')}
                </p>
            </div>

            <div className="battle-statistics-progress__bar">
                <div>
                    <span
                        style={{
                            width: lineBarFillWidth + '%',
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
