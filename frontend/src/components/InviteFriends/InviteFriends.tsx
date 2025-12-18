import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Skeleton from 'react-loading-skeleton';

import { ROUTES } from '@/lib/constants/Routes';
import { formatter } from '@/lib/helpers/format.helper';
import { CurrencyTypes } from '@/lib/types/Currency.type';

import Button from '../UI/Button/Button';

import { useReferralsData } from '@/hooks/react-queries/useReferralsData';
import { useRouter } from '@/i18n/routing';

import './inviteFriends.scss';

const InviteFriends = () => {
    const router = useRouter();
    const t = useTranslations('InviteFriends');

    const { data: referralsData, isLoading: isLoadingReferralsData, isBlogger } = useReferralsData();

    if (isLoadingReferralsData) return <Skeleton className="invite-friends" height={335} />;

    return (
        <div className="invite-friends">
            <p className="invite-friends__title">{t('Title')}</p>
            <div className="invite-friends__banner">
                <Image src={'/img/invite-friend/banner-invite.svg'} width={358} height={117} alt="invite" />
            </div>
            <small className="invite-friends__hint">{t('Hint')}</small>
            <div className="invite-friends__form">
                <div className="invite-friends__row">
                    <p>
                        {t('Received')}:{' '}
                        <span>
                            {formatter.format(
                                isBlogger ? referralsData?.earned_money || 0 : referralsData?.earned_bonuses || 0,
                            )}
                            {isBlogger && (
                                <Image
                                    src={`/img/currency/${CurrencyTypes.POINTS}.svg`}
                                    height={15}
                                    width={15}
                                    alt="currency"
                                />
                            )}
                            {!isBlogger && (
                                <Image
                                    src={`/img/currency/${CurrencyTypes.CRYSTALS}.svg`}
                                    height={15}
                                    width={15}
                                    alt="currency"
                                />
                            )}
                        </span>
                    </p>

                    <p>
                        {t.rich('Invited', {
                            span: (chunks) => <span>{chunks}</span>,
                            count: referralsData?.invited_count,
                        })}
                    </p>
                </div>
                <Button variant={'active'} onClick={() => router.push(ROUTES.REFERRALS)}>
                    {t('Send')}
                </Button>
            </div>
        </div>
    );
};

export default InviteFriends;
