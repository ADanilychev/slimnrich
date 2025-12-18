import { BattleType } from '@/lib/configs/Battle.config';

import { IAdminInfoBattle } from './battles.type';
import { IProfileResult, IProfileResultItem, IUserHistory } from './user.type';

export interface IAdminBasicInfo {
    bloggers_earned: number;
    bloggers_invited: number;
    total_lost: number;
    users_real_balance: number;
    users_bonus_balance: number;
    period_users: number;
    period_free_users: number;
    period_premium_users: number;
    total_users: number;
    active_battles: number;
    total_frozen_money: number;
    total_battles: number;
    battles_rating: {
        bymyself: IBattleRating;
        onevsfriend: IBattleRating;
        onevsone: IBattleRating;
        groupfortime: IBattleRating;
        withyourgroup: IBattleRating;
        groupbyweight: IBattleRating;
    };
}

export interface IBattleRating {
    current_battles: number;
    rating: number;
}

export const COLORS = [
    '#FF9500',
    '#FFCC00',
    '#34C759',
    '#00C7BE',
    '#5856D6',
    '#AF52DE',
    '#D02F44',
    '#4B68CC',
    '#FF9500',
    '#FFCC00',
    '#34C759',
    '#00C7BE',
    '#5856D6',
    '#AF52DE',
    '#D02F44',
    '#4B68CC',
];

export interface IAdminMetrics {
    [key: string]: {
        bar_type: 'stack' | 'horizontal';
        question: {
            [question: string]: IAnswerItem[];
        };
    };
}

export interface IAnswerItem {
    title: string;
    score: number;
}

export interface IModerator {
    id: number;
    user_id: number;
    full_name: string;
}

export interface IFormAddModerator {
    new_moderator: number;
    full_name: string;
}

export interface IBanForm {
    violator_id: number;
    period: number;
}

export interface IUserProfileData {
    name: string;
    avatar: string;
    user_id: number;
    results: IProfileResult;
    reports_by_user: number;
    reports_for_user: number;
    approved_reports_for_user: number;
    balance_history: IUserHistory;
    achievements_count: number;
    is_premium: boolean;
    ban_until: string;
    is_banned: boolean;
    battles_info: IAdminInfoBattle[];
    approved_terms_date: string;
    approved_terms_ip: string;
    reg_date: string;
    premium_date: string;
    weight_kg: number;
    weight_lost: number;
    about_data: {
        [key: string]: {
            answer: string;
            title: string;
        };
    };
}

export interface IBlogger {
    user_id: number;
    referrals_count: number;
    promo_code: string;
    name: string;
    balance: number;
    revenue_percent: number;
}

export interface IAddBloggerForm {
    user_id: number;
    promo_code: string;
    revenue_percent: number;
}

export interface IWalletInfo {
    balance: number;
    id: number;
    method: TWalletMethod;
}

export type TWalletMethod = 'stars' | 'crypto' | 'card' | 'cats' | 'dogs' | 'children' | 'developers';

export interface IWithdrawForm {
    method: TWalletMethod;
    amount: number;
}

export interface IGetBattleFilter {
    battle_id: number | null;
    battle_type: BattleType | null;
}
