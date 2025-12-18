import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { useNotificationInView } from '@/components/Badges/NotificationsBadge/useNotificationInView';
import { BattleImage } from '@/components/BattleItem/BattleImage/BattleImage';

import { BattleType } from '@/lib/configs/Battle.config';
import { ROUTES } from '@/lib/constants/Routes';
import { INotificationItem } from '@/lib/types/services/notification.type';

import { Link } from '@/i18n/routing';

import '../notification.base.scss';
import './notificationBattle.scss';

export function NotificationBattle({
    entity,
    onViewPortAction,
}: {
    entity: INotificationItem;
    onViewPortAction: (entity: INotificationItem) => void;
}) {
    const t = useTranslations('Notification.NotificationBattle');
    const { ref } = useNotificationInView(entity, onViewPortAction);

    return (
        <div className="notification-item notification-item_battle" ref={ref}>
            <div className="notification-item__type">
                <BattleImage battle_type={entity.name as BattleType} size={53} />
            </div>
            <div className="notification-item__content">
                <p className="notification-item__message">
                    {t('Successful')}{' '}
                    <Link href={ROUTES.BATTLE_STATISTICS(entity.name as BattleType)}>{t('Battle')}</Link>
                    <b>
                        {entity.amount} <Image src={`/img/currency/points.svg`} height={18} width={18} alt="point" />
                    </b>
                </p>
                <small className="notification-item__submessage">{entity.user_id}</small>
            </div>
        </div>
    );
}
