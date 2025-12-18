'use client';

import Skeleton from 'react-loading-skeleton';

import { BattleConfig } from '@/lib/configs/Battle.config';
import { IAdminInfoBattle } from '@/lib/types/services/battles.type';

import { BattleItem } from './BattleItem/BattleItem';

import '../admin-badge.scss';
import './battlesBadge.scss';

export const BattlesBadge = ({ battles, isLoading }: { battles: IAdminInfoBattle[]; isLoading: boolean }) => {
    if (isLoading) return <Skeleton className="admin-badge battles-badge" height={400} />;

    return (
        <div className="admin-badge battles-badge">
            <div className="admin-badge__header">
                <p className="admin-badge__title">All battles</p>
            </div>
            <div className="admin-badge__content">
                {battles?.map((battle) => (
                    <BattleItem baseBattle={BattleConfig[battle.title]} key={battle.id} entity={battle} />
                ))}
            </div>
        </div>
    );
};
