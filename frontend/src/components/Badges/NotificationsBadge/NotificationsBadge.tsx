import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { IoIosNotificationsOutline } from 'react-icons/io';
import Skeleton from 'react-loading-skeleton';

import { NotificationBattle } from '@/components/Notification/NotificationBattle/NotificationBattle';
import { NotificationPhoto } from '@/components/Notification/NotificationPhoto/NotificationPhoto';
import { NotificationReferral } from '@/components/Notification/NotificationReferral/NotificationReferral';
import TabMenu from '@/components/UI/TabMenu/TabMenu';

import { INotificationItem, NOTIFICATION_TABS } from '@/lib/types/services/notification.type';

import { useDebounceReadAlerts } from './useDebounceReadAlerts';
import { NotificationService } from '@/services/notification.service';

import '../badge.scss';
import './notificationsBadge.scss';

export function NotificationsBadge() {
    const t = useTranslations('Badges.NotificationsBadge');

    const [currentTab, setCurrentTab] = useState(NOTIFICATION_TABS.LIKE);
    const queryClient = useQueryClient();
    const [readAlertsIds, setReadAlertsIds] = useState<number[]>([]);
    const debouncedReadAlertsIds = useDebounceReadAlerts(readAlertsIds, 1000);

    const { data, isLoading } = useQuery({
        queryKey: ['fetch-notifications', currentTab],
        queryFn: async () => await NotificationService.getNotifications(NOTIFICATION_TABS.ALL, 1),
    });

    const { mutate } = useMutation({
        mutationFn: async () =>
            await NotificationService.readNotifications({ alert_ids: readAlertsIds, all_condition: false }),
        mutationKey: ['read-notifications'],
        onSuccess: () => {
            setReadAlertsIds([]);
            queryClient.invalidateQueries({ queryKey: ['get-user-basic-data'] });
        },
    });

    const { like, battle, referral } = data ?? {};

    const currentListTab = useMemo(() => {
        switch (currentTab) {
            case NOTIFICATION_TABS.LIKE:
                return like;
            case NOTIFICATION_TABS.BATTLE:
                return battle;
            case NOTIFICATION_TABS.REFERRAL:
                return referral;
            default:
                return like;
        }
    }, [data, currentTab]);

    const renderNotificationItem = (entity: INotificationItem) => {
        switch (currentTab) {
            case NOTIFICATION_TABS.LIKE:
                return <NotificationPhoto onViewPortAction={onViewPortAction} entity={entity} key={entity.id} />;
            case NOTIFICATION_TABS.BATTLE:
                return <NotificationBattle onViewPortAction={onViewPortAction} entity={entity} key={entity.id} />;
            case NOTIFICATION_TABS.REFERRAL:
                return <NotificationReferral onViewPortAction={onViewPortAction} entity={entity} key={entity.id} />;
        }
    };

    const onViewPortAction = (entity: INotificationItem) => {
        setReadAlertsIds((prev) => [...prev, entity.id]);
    };

    useEffect(() => {
        if (debouncedReadAlertsIds && debouncedReadAlertsIds.length) {
            mutate();
        }
    }, [debouncedReadAlertsIds]);

    const isEmpty = currentListTab?.length === 0;

    return (
        <div className="badge notifications-badge">
            <div className="badge__header">
                <TabMenu
                    className="notification-page__tabs"
                    activeLink={currentTab}
                    links={[
                        {
                            text: `${t('Tabs.Photo')} ${data?.like_size ?? ''}`,
                            link: () => setCurrentTab(NOTIFICATION_TABS.LIKE),
                            slug: NOTIFICATION_TABS.LIKE,
                        },
                        {
                            text: `${t('Tabs.Battle')} ${data?.battle_size ?? ''}`,
                            link: () => setCurrentTab(NOTIFICATION_TABS.BATTLE),
                            slug: NOTIFICATION_TABS.BATTLE,
                        },
                        {
                            text: `${t('Tabs.Referrals')} ${data?.referral_size ?? ''}`,
                            link: () => setCurrentTab(NOTIFICATION_TABS.REFERRAL),
                            slug: NOTIFICATION_TABS.REFERRAL,
                        },
                    ]}
                />
            </div>

            {isLoading && <Skeleton className="badge__content" height={100} />}
            {!isLoading && (
                <div className="badge__content">
                    {!isEmpty && currentListTab?.map((item) => renderNotificationItem(item))}
                    {isEmpty && (
                        <div className="notifications-badge__empty">
                            <IoIosNotificationsOutline size={50} color="var(--blue-700)" />
                            <p>{t('EmptyList')}</p>
                        </div>
                    )}
                    {/* {!isEmpty && <Button variant={'active'}>Load More</Button>} */}
                </div>
            )}
        </div>
    );
}
