'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import Button from '@/components/UI/Button/Button';
import MoveTabMenu from '@/components/UI/MoveTabMenu/MoveTabMenu';

import { PREMIUM_PLANS, PREMIUM_TYPES } from '@/lib/configs/Premium.config';
import { ROUTES } from '@/lib/constants/Routes';
import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';

import PremiumPlan from './PremiumPlan/PremiumPlan';
import { useRouter } from '@/i18n/routing';
import { UserService } from '@/services/user.service';

import './premium.scss';

const Premium = () => {
    const t = useTranslations('Pages.PremiumPage');

    const router = useRouter();
    const queryClient = useQueryClient();
    const [period, setPeriod] = useState<'Monthly' | 'Yearly'>('Monthly');

    const { mutateAsync, isPending } = useMutation({
        mutationKey: ['buy-premium'],
        mutationFn: async (period: 'monthly' | 'yearly') => await UserService.buyPremium({ period }),
    });

    const onSelect = (type: 'monthly' | 'yearly') => {
        mutateAsync(type, {
            onSuccess: async () => {
                queryClient.invalidateQueries({ queryKey: ['get-user-basic-data'] });
                const { toast } = await import('react-hot-toast');

                toast.success(t('Success'));

                router.push(ROUTES.BATTLE);
            },
            onError: async (error) => {
                await ApiErrorHandler(error, t('Error'));
                router.push(ROUTES.EXCHANGE);
            },
        });
    };

    return (
        <div className="premium-page">
            <div className="premium-page__header">
                {t.rich('Title', {
                    h2: (chunks) => <h2>{chunks}</h2>,
                })}
            </div>

            <div className="main-content">
                <MoveTabMenu
                    tabs={[{ Monthly: t('Monthly') }, { Yearly: t('Yearly') }]}
                    activeTab={period}
                    changeHandler={(tab) => setPeriod(tab as 'Monthly' | 'Yearly')}
                />

                <div className="premium-page__plans">
                    {PREMIUM_PLANS.map((plan, index) => (
                        <PremiumPlan
                            isLoading={isPending}
                            onPlanSelect={onSelect}
                            period={period}
                            plan={plan}
                            isCurrentPlan={plan.type === PREMIUM_TYPES.BASIC}
                            isActive={plan.type === PREMIUM_TYPES.PREMIUM}
                            key={index}
                        />
                    ))}
                </div>

                <div className="premium-page__buttons">
                    {/* <Button variant={'active'} disabled={true}>
                        Add premium and open battles!
                    </Button> */}
                    <Button variant={'transparent'} onClick={() => router.back()}>
                        {t('Back')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Premium;
