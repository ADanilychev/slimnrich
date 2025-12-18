'use client';

import { formatDistance } from 'date-fns/formatDistance';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';

import { useNotificationInView } from '@/components/Badges/NotificationsBadge/useNotificationInView';
import { UserFrame } from '@/components/UserFrame/UserFrame';

import { ROUTES } from '@/lib/constants/Routes';
import { formatter } from '@/lib/helpers/format.helper';
import { INotificationItem } from '@/lib/types/services/notification.type';

import { Link } from '@/i18n/routing';

import '../notification.base.scss';
import './notificationPhoto.scss';

export function NotificationPhoto({
    entity,
    onViewPortAction,
}: {
    entity: INotificationItem;
    onViewPortAction?: (entity: INotificationItem) => void;
}) {
    const locale = useLocale();

    const t = useTranslations('Notification.NotificationPhoto');
    const { ref } = useNotificationInView(entity, onViewPortAction ?? (() => {}));

    return (
        <div className="notification-item notification-item_photo" ref={ref}>
            <div className="notification-item__type">
                <UserFrame
                    src={entity.avatar}
                    achievementCount={entity.achievements_count ?? 0}
                    goToProfile={() => {}}
                    width={46}
                    height={46}
                />
            </div>
            <div className="notification-item__content">
                <p className="notification-item__message">
                    <Link href={ROUTES.USER(entity.user_id)}>{entity.name}</Link> {t('Gives')}
                    <b>
                        {formatter.format(entity.amount ?? 0)}{' '}
                        <Image src={`/img/currency/crystals.svg`} height={18} width={18} alt="crystals" /> {t('Slims')}
                    </b>
                </p>
                <small className="notification-item__submessage">
                    {entity.timestamp &&
                        formatDistance(entity.timestamp * 1000, Date.now(), {
                            addSuffix: true,
                            locale: require('date-fns/locale')[locale],
                            includeSeconds: true,
                        })}
                </small>
            </div>
            {entity.file && (
                <div className="notification-item__image">
                    <Image src={entity.file} fill alt="images" />
                </div>
            )}
        </div>
    );
}
