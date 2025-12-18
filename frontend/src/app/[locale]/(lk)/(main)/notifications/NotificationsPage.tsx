'use client';

import { useTranslations } from 'next-intl';

import { NotificationsBadge } from '@/components/Badges/NotificationsBadge/NotificationsBadge';

import './notificationsPage.scss';

export function NotificationsPage() {
    const t = useTranslations('Pages.NotificationsPage');
    return (
        <div className="notification-page">
            <div className="notification-page__top">
                <h1>{t('Title')}</h1>
            </div>

            <div className="main-content">
                <NotificationsBadge />
            </div>
        </div>
    );
}
