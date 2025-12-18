'use client';

import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';

import BalanceBadge from '@/components/Badges/BalanceBadge/BalanceBadge';
import ExchangeCoinsForm from '@/components/ExchangeCoinsForm/ExchangeCoinsForm';
import MainLoader from '@/components/MainLoader/MainLoader';
import TabMenu from '@/components/UI/TabMenu/TabMenu';

import TabTopWrapper from '@/hoc/TabTopWrapper/TabTopWrapper';

import { IUserHistoryItem } from '@/lib/types/services/user.type';

import { useBalanceHistory } from '@/hooks/react-queries/useBalanceHistory';

import './exchangePage.scss';

const BalanceHistoryBadgeDynamic = dynamic(() => import('@/components/Badges/BalanceHistoryBadge/BalanceHistoryBadge'));

export const ExchangePage = () => {
    const t = useTranslations('Pages.ExchangePage');
    const [exchangeTab, setExchangeTab] = useState<'BUY' | 'SELL'>('BUY');

    const { data: balanceHistory, isLoading: isLoadingBalanceHistory } = useBalanceHistory({
        page: 1,
        history_type: 'all',
    });

    const historyToDisplay = useMemo(() => {
        const result: IUserHistoryItem[] = [];
        const MAX_COUNT = 5;

        if (!balanceHistory) return result;

        const keys = Object.keys(balanceHistory.result);
        for (let index = 0; index < keys.length; index++) {
            const key = keys[index];

            for (let x = 0; x < balanceHistory.result[key].length; x++) {
                if (result.length === MAX_COUNT) break;
                result.push(balanceHistory.result[key][x]);
            }
            if (result.length === MAX_COUNT) break;
        }

        return result;
    }, [balanceHistory]);

    if (isLoadingBalanceHistory) return <MainLoader />;

    return (
        <div className="exchange-page">
            <TabTopWrapper>
                <h1>{t('Title')}</h1>
                <TabMenu
                    className="exchange-page__tabs"
                    activeLink={exchangeTab}
                    links={[
                        {
                            text: t('Tabs.Buy'),
                            link: () => setExchangeTab('BUY'),
                            slug: 'BUY',
                        },
                        {
                            text: t('Tabs.Sell'),
                            link: () => setExchangeTab('SELL'),
                            slug: 'SELL',
                        },
                    ]}
                />
            </TabTopWrapper>
            <div className="main-content">
                <ExchangeCoinsForm form={exchangeTab} />
                <BalanceBadge />
                <BalanceHistoryBadgeDynamic history={historyToDisplay} />
            </div>
        </div>
    );
};
