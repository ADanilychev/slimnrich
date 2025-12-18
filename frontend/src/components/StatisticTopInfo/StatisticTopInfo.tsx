'use client';

import { useMutation } from '@tanstack/react-query';
import { shareMessage } from '@telegram-apps/sdk-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';

import { useProfileStats } from '@/hooks/react-queries/useProfileStats';
import { useTransformNumberSystem } from '@/hooks/useTransformNumberSystem';
import { Link } from '@/i18n/routing';
import { UserService } from '@/services/user.service';

import './statisticTopInfo.scss';

export const StatisticTopInfo = () => {
    const t = useTranslations('StatisticTopInfo');

    const { transformValueWithNumberSystem } = useTransformNumberSystem();
    const { data, isLoading } = useProfileStats();

    const { mutateAsync } = useMutation({
        mutationKey: ['shareMessage'],
        mutationFn: async () => UserService.shareMessage(),
    });

    const monthData = useMemo(() => {
        return data?.result[30];
    }, [data]);

    const allData = useMemo(() => {
        return data?.result.all;
    }, [data]);

    const shareMessageHandler = async () => {
        try {
            const { result: shareMessageId } = await mutateAsync();
            if (shareMessage.isAvailable()) {
                await shareMessage(shareMessageId);
            }
        } catch (e) {
            console.error(`Error while sharing message: ${e}`);
        }
    };

    if (isLoading) return <Skeleton height={210} className="skeleton-statistic-top-info" />;

    return (
        <div className="statistic-top-info">
            <div className="statistic-top-info__left">
                <div className="statistic-top-info__lost">
                    <small>{t('Lost')}:</small>
                    <div>
                        <Link href={'#'}>{transformValueWithNumberSystem(monthData?.change || 0, 'weight')}</Link>

                        <button className="statistic-top-info__share" onClick={shareMessageHandler}>
                            <svg
                                width="11"
                                height="10"
                                viewBox="0 0 11 10"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M7.73334 0.666403C7.61421 0.547306 7.46244 0.466205 7.29722 0.433351C7.132 0.400497 6.96075 0.417366 6.80511 0.481826C6.64948 0.546285 6.51645 0.655441 6.42285 0.795494C6.32924 0.935546 6.27926 1.10021 6.27923 1.26866V1.94418H4.22201C3.20569 1.94531 2.23132 2.34954 1.51267 3.06818C0.794029 3.78682 0.389799 4.76119 0.388672 5.77751L0.388672 8.75898C0.388672 8.87195 0.433546 8.98028 0.513423 9.06016C0.593299 9.14003 0.701635 9.18491 0.814598 9.18491C0.92756 9.18491 1.0359 9.14003 1.11577 9.06016C1.19565 8.98028 1.24052 8.87195 1.24052 8.75898C1.2412 8.08142 1.51066 7.4318 1.98978 6.95268C2.46889 6.47357 3.11851 6.20411 3.79608 6.20343H6.27923V6.87895C6.27926 7.0474 6.32924 7.21206 6.42285 7.35212C6.51645 7.49217 6.64948 7.60133 6.80511 7.66578C6.96075 7.73024 7.132 7.74711 7.29722 7.71426C7.46244 7.68141 7.61421 7.6003 7.73334 7.48121L10.2374 4.97719C10.4769 4.73758 10.6115 4.41263 10.6115 4.07381C10.6115 3.73499 10.4769 3.41004 10.2374 3.17042L7.73334 0.666403Z"
                                    fill="white"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="statistic-top-info__stat">
                    <div className="stat-item">
                        <small>{t('Total')}:</small>
                        <p>{transformValueWithNumberSystem(allData?.change || 0, 'weight')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
