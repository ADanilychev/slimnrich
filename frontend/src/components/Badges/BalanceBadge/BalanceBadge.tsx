import { useTranslations } from 'next-intl';
import Skeleton from 'react-loading-skeleton';

import CurrencyBadge from '@/components/CurrencyBadge/CurrencyBadge';

import { CurrencyTypes } from '@/lib/types/Currency.type';

import { useProfile } from '@/hooks/react-queries/useProfile';

import '../badge.scss';
import './balanceBadge.scss';

const BalanceBadge = () => {
    const t = useTranslations('Badges.BalanceBadge');
    const { data, isLoading } = useProfile();

    if (isLoading) return <Skeleton className="badge balance-badge" height={135} />;

    return (
        <div className="badge balance-badge">
            <div className="badge__header">
                <p className="badge__title">{t('Title')}</p>
            </div>
            <div className="badge__content">
                <div className="balance-badge__currency">
                    <p className="currency-text">{t('SlimsCoin')}:</p>
                    <CurrencyBadge type={CurrencyTypes.POINTS} count={data?.balance} />
                </div>
                <div className="balance-badge__currency">
                    <p className="currency-text">{t('BonesCoin')}:</p>
                    <CurrencyBadge type={CurrencyTypes.CRYSTALS} count={data?.bonus_balance} />
                </div>
                <div className="balance-badge__currency">
                    <p className="currency-text">{t('FrozenCoin')}:</p>
                    <CurrencyBadge type={CurrencyTypes.FROZEN} count={data?.frozen_balance} />
                </div>
            </div>
        </div>
    );
};

export default BalanceBadge;
