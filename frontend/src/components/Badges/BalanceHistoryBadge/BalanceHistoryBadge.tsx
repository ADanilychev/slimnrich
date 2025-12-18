import { useTranslations } from 'next-intl';

import { ROUTES } from '@/lib/constants/Routes';
import cn from '@/lib/import/classnames';
import { IUserHistoryItem } from '@/lib/types/services/user.type';

import HistoryItem from './HistoryItem/HistoryItem';
import { Link } from '@/i18n/routing';

import '../badge.scss';
import './balanceHistoryBadge.scss';

const BalanceHistoryBadge = ({
    history,
    showBalanceHistoryLink = true,
    title,
}: {
    history?: IUserHistoryItem[];
    showBalanceHistoryLink?: boolean;
    title?: string;
}) => {
    const t = useTranslations('Badges.BalanceHistoryBadge');
    return (
        <div className="badge balance-history-badge">
            <div className="badge__header">
                <p className="badge__title">{title || t('Title')}</p>
                {showBalanceHistoryLink && history && history?.length > 0 && (
                    <Link href={ROUTES.BALANCE_HISTORY}>{t('TitleLink')}</Link>
                )}
            </div>
            <div
                className={cn('badge__content', {
                    badge__content_empty: !history?.length,
                })}
            >
                {!history?.length && <p className="content__empty">{t('EmptyList')}</p>}
                {history && history.map((item, index) => <HistoryItem item={item} key={index} />)}
            </div>
        </div>
    );
};

export default BalanceHistoryBadge;
