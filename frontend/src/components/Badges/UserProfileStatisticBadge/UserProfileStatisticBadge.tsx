import { useTranslations } from 'next-intl';

import { useTransformNumberSystem } from '@/hooks/useTransformNumberSystem';

import '../badge.scss';
import './userProfileStatisticBadge.scss';

export function UserProfileStatisticBadge({
    weight_lost,
    current_weight,
    reg_date,
}: {
    weight_lost: number;
    current_weight: number;
    reg_date: string;
}) {
    const t = useTranslations('Badges.UserProfileStatisticBadge');
    const { transformValueWithNumberSystem } = useTransformNumberSystem();

    return (
        <div className="badge user-profile-statistic-badge">
            <div className="badge__header">
                <p className="badge__title">{t('Title')}</p>
            </div>

            <div className="badge__content">
                <div className="user-profile-statistic-badge__row">
                    <p>{t('InApp')}:</p>
                    <b>{reg_date}</b>
                </div>
                <div className="user-profile-statistic-badge__row">
                    <p>{t('WeightLost')}:</p>
                    <b>{transformValueWithNumberSystem(weight_lost, 'weight')}</b>
                </div>
                <div className="user-profile-statistic-badge__row">
                    <p>{t('CurrentWeight')}:</p>
                    <b>{transformValueWithNumberSystem(current_weight, 'weight')}</b>
                </div>
            </div>
        </div>
    );
}
