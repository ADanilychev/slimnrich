import Image from 'next/image';
import { useMemo } from 'react';

import { IUserHistoryItem } from '@/lib/types/services/user.type';

import './historyItem.scss';

const HistoryItem = ({ item }: { item: IUserHistoryItem }) => {
    const currencySrc = useMemo(() => {
        switch (item.balance_type) {
            case 'real':
                return '/img/currency/points.svg';
            case 'bonus':
                return '/img/currency/crystals.svg';
            default:
                return '/img/currency/points.svg';
        }
    }, [item]);

    return (
        <div className="history-item">
            <p className="history-item__info">{item.subtitle}</p>
            <div className="history-item__block">
                <p
                    style={{
                        color: item.amount > 0 ? 'var(--green-500)' : 'var(--red-500)',
                    }}
                >
                    {item.amount > 0 && '+ '}
                    {item.amount}
                </p>
                <Image src={currencySrc} width={20} height={20} alt="coins" />
                <p
                    style={{
                        color: item.balance_type === 'bonus' ? 'rgba(224, 29, 70, 1)' : '#f77600',
                    }}
                >
                    Slims
                </p>
            </div>
        </div>
    );
};

export default HistoryItem;
