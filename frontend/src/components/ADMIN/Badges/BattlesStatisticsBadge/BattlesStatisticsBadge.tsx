'use client';

import { useTranslations } from 'next-intl';
import Skeleton from 'react-loading-skeleton';

import { BattleConfig } from '@/lib/configs/Battle.config';
import { formatter } from '@/lib/helpers/format.helper';

import { useAdminBasicInfo } from '@/hooks/react-queries/useAdminBasicInfo';

import '../admin-badge.scss';
import './battlesStatisticsBadge.scss';

export const BattlesStatisticsBadge = () => {
    const tBattleConfig = useTranslations('BattleConfig');

    const { data, isLoading } = useAdminBasicInfo({});

    if (isLoading) return <Skeleton className="admin-badge battles-statistics-badge" height={180} />;

    return (
        <div className="admin-badge battles-statistics-badge">
            <div className="admin-badge__header">
                <p className="admin-badge__title">Battles statistics:</p>
            </div>
            <div className="admin-badge__content">
                <div className="battles-statistics-badge__top">
                    <div>
                        <h1>Total battles:</h1>
                        <h2>{formatter.format(data?.total_battles || 0)}</h2>
                    </div>
                    <div>
                        <h1>Users real balance:</h1>
                        <h2>{formatter.format(data?.users_real_balance || 0)}</h2>
                    </div>
                </div>

                <div className="battles-statistics-badge__filters"></div>

                <div className="battles-statistics-badge__stats">
                    <div className="battles-statistics-badge__row">
                        <p>Active battles:</p>
                        <b>{formatter.format(data?.active_battles || 0)}</b>
                    </div>
                    <div className="battles-statistics-badge__row">
                        <p>Users bonus balance:</p>
                        <b>{formatter.format(data?.users_bonus_balance || 0)}</b>
                    </div>
                    <div className="battles-statistics-badge__row">
                        <p>Frozen money:</p>
                        <b>{formatter.format(data?.total_frozen_money || 0)}</b>
                    </div>
                </div>

                <div className="battles-statistics-badge__bottom">
                    {Object.entries(data?.battles_rating || {}).map(([key, value]) => (
                        <div key={key} className="battles-statistics-badge__graph">
                            <h3>
                                {tBattleConfig(BattleConfig[key].type + '.Title')}
                                <span
                                    style={{
                                        background: BattleConfig[key].color,
                                    }}
                                />
                            </h3>
                            <div className="battles-statistics-badge__graph-bar">
                                <span
                                    style={{
                                        width: `${value.rating}%`,
                                        background: BattleConfig[key].color,
                                    }}
                                />
                                <p style={{ color: BattleConfig[key].color }}>{value.rating} %</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
