import { useTranslations } from 'next-intl';

import { Progress } from '../Progress/Progress';

import './battleStatistics.scss';

export function BattleStatistics({ goal, reached }: { goal: number; reached: number }) {
    const t = useTranslations('BattleStatistics');
    return (
        <div className="base-battle-widget battle-statistics">
            <div className="base-battle-widget__header">
                <p className="base-battle-widget__title">{t('Title')}</p>
            </div>
            <div className="base-battle-widget__content">
                <Progress goal={goal} reached={reached} />
            </div>
        </div>
    );
}
