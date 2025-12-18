'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
import Skeleton from 'react-loading-skeleton';

import { ElementHint } from '@/hoc/ElementHint/ElementHint';

import { ROUTES } from '@/lib/constants/Routes';
import { CurrencyTypes } from '@/lib/types/Currency.type';

import { AccordionItem } from '../Accordion/AccordionItem';
import CurrencyBadge from '../CurrencyBadge/CurrencyBadge';
import { UserFrame } from '../UserFrame/UserFrame';

import { useProfile } from '@/hooks/react-queries/useProfile';
import { Link, useRouter } from '@/i18n/routing';

import './header.scss';

const Header = () => {
    const router = useRouter();
    const { data, isLoading } = useProfile();
    const t = useTranslations('Header');

    const [showHint, setShowHint] = useState<boolean>(false);

    if (isLoading) return <Skeleton height={40} />;

    return (
        <header>
            <div className="with-notifications">
                <UserFrame
                    src={data?.avatar}
                    achievementCount={data?.achievements_count}
                    goToProfile={() => router.push(ROUTES.PROFILE)}
                />
                <Link href={ROUTES.NOTIFICATIONS} className="with-notifications__info">
                    <p>{data?.new_alerts}</p>
                    <Image src="/img/currency/ring.svg" width={18} height={18} alt="notifications" />
                </Link>
            </div>

            <div className="header-controls">
                <CurrencyBadge type={CurrencyTypes.POINTS} count={data?.balance} />
                <ElementHint
                    isActive={showHint}
                    isLastElement={false}
                    closeHandler={() => setShowHint(false)}
                    nextHandler={() => {
                        throw new Error('Function not implemented.');
                    }}
                    renderHint={() => (
                        <>
                            <p className="header-hint__close" onClick={() => setShowHint(false)}>
                                {t('Close')}
                            </p>
                            <AccordionItem title={t('Hint.Accrual.Title')}>
                                {t.rich('Hint.Accrual.Text', {
                                    title: (chunks) => <h4 className="header-hint__title">{chunks}</h4>,
                                    text: (chunks) => <p className="base-element-hint__modal-text">{chunks}</p>,
                                })}
                            </AccordionItem>
                            <AccordionItem title={t('Hint.Premium.Title')}>
                                {t.rich('Hint.Premium.Text', {
                                    title: (chunks) => <h4 className="header-hint__title">{chunks}</h4>,
                                    text: (chunks) => <p className="base-element-hint__modal-text">{chunks}</p>,
                                })}
                            </AccordionItem>
                            <AccordionItem title={t('Hint.Airdrop.Title')}>
                                {t.rich('Hint.Airdrop.Text', {
                                    title: (chunks) => <h4 className="header-hint__title">{chunks}</h4>,
                                    text: (chunks) => <p className="base-element-hint__modal-text">{chunks}</p>,
                                })}
                            </AccordionItem>
                        </>
                    )}
                >
                    <CurrencyBadge
                        type={CurrencyTypes.CRYSTALS}
                        count={data?.bonus_balance}
                        onClick={() => setShowHint(!showHint)}
                    />
                </ElementHint>

                {data?.is_premium && (
                    <Image width={25} height={25} src={'/img/currency/premium.svg'} alt="premium-icon" />
                )}
            </div>
        </header>
    );
};

export default Header;
