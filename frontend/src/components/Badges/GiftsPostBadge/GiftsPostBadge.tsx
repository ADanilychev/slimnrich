import { useTranslations } from 'next-intl';
import React from 'react';
import { LuCircleArrowLeft } from 'react-icons/lu';

import { NotificationPhoto } from '@/components/Notification/NotificationPhoto/NotificationPhoto';

import { INotificationItem } from '@/lib/types/services/notification.type';

import { useRouter } from '@/i18n/routing';

import '../badge.scss';
import './giftsPostBadge.scss';

export default function GiftsPostBadge({ data }: { data: INotificationItem[] }) {
    const router = useRouter();
    const t = useTranslations('Badges.GiftsPostBadge');

    return (
        <div className="badge gifts-post-badge">
            <div className="badge__header gifts-post-badge__top">
                <p onClick={() => router.back()} className="badge__black">
                    <LuCircleArrowLeft />
                    {t('GoBack')}
                </p>

                <p className="badge__title">{t('Title')}</p>
            </div>
            <div className="badge__content gifts-post-badge__content">
                {data && data.map((item) => <NotificationPhoto entity={item} key={item.user_id} />)}
            </div>
        </div>
    );
}
