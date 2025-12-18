'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { SendBattleCodeBadge } from '@/components/Badges/SendBattleCodeBadge/SendBattleCodeBadge';
import MainLoader from '@/components/MainLoader/MainLoader';
import { ReferralsTables } from '@/components/ReferralsTables/ReferralsTables';
import Button from '@/components/UI/Button/Button';

import TabTopWrapper from '@/hoc/TabTopWrapper/TabTopWrapper';

import { formatter } from '@/lib/helpers/format.helper';
import { CurrencyTypes } from '@/lib/types/Currency.type';

import ControlHeader from '../profile/Controls/ControlHeader/ControlHeader';

import { useReferralsData } from '@/hooks/react-queries/useReferralsData';
import { useRouter } from '@/i18n/routing';

import '../settings/settings.scss';
import './referrals.scss';

export function Referrals() {
    const t = useTranslations('Pages.ReferralsPage');
    const router = useRouter();

    const { data: referralsData, isLoading: isLoadingReferralsData, isBlogger } = useReferralsData();

    if (isLoadingReferralsData) return <MainLoader />;

    return (
        <div className="settings-page referrals-page">
            <TabTopWrapper>
                <ControlHeader text={t('Title')} ico={'/img/profileControls/inviteFriends.svg'} />

                <div className="main-content">
                    <div className="referrals-page__info">
                        <div className="info-item">
                            <p>{t('TotalInvited')}:</p>
                            <small>
                                {formatter.format(referralsData?.invited_count || 0)} {t('Users')}
                            </small>
                        </div>
                        <div className="info-item">
                            <p>{t('TotalEarned')}:</p>
                            <small>
                                {formatter.format(
                                    isBlogger ? referralsData?.earned_money || 0 : referralsData?.earned_bonuses || 0,
                                )}
                                {isBlogger && (
                                    <Image
                                        src={`/img/currency/${CurrencyTypes.POINTS}.svg`}
                                        height={25}
                                        width={25}
                                        alt="currency"
                                    />
                                )}
                                {!isBlogger && (
                                    <Image
                                        src={`/img/currency/${CurrencyTypes.CRYSTALS}.svg`}
                                        height={25}
                                        width={25}
                                        alt="currency"
                                    />
                                )}
                            </small>
                        </div>
                    </div>

                    <div className="referrals-page__table">
                        <ReferralsTables isBlogger={isBlogger} />
                    </div>

                    <div className="referrals-page__footer">
                        <SendBattleCodeBadge
                            code={referralsData?.invite_link || ''}
                            title={t('SendTitle')}
                            btnVariant="active"
                        />

                        <Button variant="transparent" onClick={() => router.back()}>
                            {t('Back')}
                        </Button>
                    </div>
                </div>
            </TabTopWrapper>
        </div>
    );
}
