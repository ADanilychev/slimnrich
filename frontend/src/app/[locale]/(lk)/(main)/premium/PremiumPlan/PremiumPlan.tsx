import { useTranslations } from 'next-intl';
import Image from 'next/image';

import Button from '@/components/UI/Button/Button';

import { PREMIUM_PLANS, PREMIUM_TYPES } from '@/lib/configs/Premium.config';
import cn from '@/lib/import/classnames';

import './premiumPlan.scss';

const PremiumPlan = ({
    plan,
    isActive = false,
    isCurrentPlan = false,
    period = 'Monthly',
    onPlanSelect,
    isLoading = false,
}: {
    plan: (typeof PREMIUM_PLANS)[0];
    isActive?: boolean;
    isCurrentPlan?: boolean;
    period?: 'Monthly' | 'Yearly';
    onPlanSelect: (type: 'monthly' | 'yearly') => void;
    isLoading: boolean;
}) => {
    const t = useTranslations('Pages.PremiumPage');

    const diplomaFree = typeof plan.options.diploma === 'string' ? t('free') : plan.options.diploma;
    const editProfileFree = typeof plan.options.editProfile === 'string' ? t('free') : plan.options.editProfile;
    return (
        <div
            className={cn('premium-plan', {
                'premium-plan_active': isActive,
            })}
        >
            <div className="premium-plan__bg">
                <div className="premium-plan__header">{t('Plans.' + plan.type + '.name')}</div>
                <div className="premium-plan__content">
                    <div className="premium-plan__info">
                        <p>
                            <span>{plan.options.modes}</span> {t('Modes')}
                        </p>
                        <p>
                            <span>${diplomaFree}</span> {t('diploma')}
                        </p>
                        <p>
                            <span>${editProfileFree}</span> {t('EditProfile')}
                        </p>
                        <p style={{ opacity: plan.options.isPremiumChat ? '1' : 0 }}>
                            <span>{t('Chat')}</span>
                        </p>
                    </div>
                    <div className="premium-plan__image">
                        <Image height={112} width={155} src={`/img/premium/${plan.type}.svg`} alt={plan.name} />
                    </div>
                    <div className="premium-plan__price">
                        <p>
                            <span>
                                {period === 'Monthly' ? plan.price.month : plan.price.year} {t('slims')}
                            </span>
                            /{period === 'Monthly' ? 'mo' : 'year'}
                        </p>
                    </div>
                    <div className="premium-plan__button">
                        <Button
                            variant={isCurrentPlan ? 'stroke' : 'gradient'}
                            disabled={isCurrentPlan}
                            onClick={() => onPlanSelect(period.toLocaleLowerCase() as 'monthly' | 'yearly')}
                            isLoading={isLoading && plan.type === PREMIUM_TYPES.PREMIUM}
                        >
                            {isCurrentPlan ? t('Current') : t('Buy')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PremiumPlan;
