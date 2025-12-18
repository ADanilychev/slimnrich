import { INumberSystem } from '@/lib/constants/NumberSystem';

import { IAchievementItem } from './achievement.type';

export interface IBasicUserData {
    name: string;
    avatar: string;
    user_id: number;
    achievements_count: number;
    action: number;
    is_banned: boolean;
    banned: number;
    is_premium: boolean;
    premium: number;
    balance: number;
    bonus_balance: number;
    frozen_balance: number;
    frozen_bonus_balance: number;
    frozen_total_balance: number;
    numbers_system: INumberSystem;
    language: string;
    timezone: number;
    notifications: boolean;
    weight_kg: number;
    height_cm: number;
    start_weight_kg: number;
    start_height_cm: number;
    month_weight: number;
    new_achievements: IAchievementItem[];
    timestamp: number;
    new_alerts: string;
}

export interface IChangeProfilePayload {
    nickname: string;
    premium_only: boolean;
    file: File | null;
}

export interface IEditProfileForm {
    nickname: string;
    file: File | null;
}

export interface IUserHistory {
    result: {
        [date: string]: IUserHistoryItem[];
    };
    total_pages: number;
}

export interface IUserHistoryItem {
    balance_type: 'real' | 'bonus';
    subtitle: string;
    amount: number;
}

export interface IUserHistoryPayload {
    start_timestamp?: number;
    end_timestamp?: number;
    history_type: 'all' | 'real' | 'bonus';
    page: number;
}

export type TBalanceHistoryType = 'all' | 'real' | 'bonus';

export interface IOtherProfileData {
    name: string;
    avatar: string;
    user_id: number;
    results: IProfileResult;
    weight_kg: number;
    weight_lost: number;
    reg_date: string;
    is_premium: boolean;
    achievements_count: number;
}

export interface IProfileResult {
    weight: IProfileResultItem[];
    food: IProfileResultItem[];
    life: IProfileResultItem[];
}

export interface IProfileResultItem {
    id: number;
    gifts: number;
    weight: number;
    calories: number;
    title: string;
    description: string;
    photo: string;
    date: string;
}

export interface IReferralsData {
    invite_link: string;
    promo_code: string;
    invited_count: number;
    earned_money: number;
    earned_bonuses: number;
    timestamp: number;
}

export interface IFilterReferralsRevenue {
    balance_type: 'real' | 'bonus';
    start_timestamp?: number;
    end_timestamp?: number;
    page?: number;
}

export interface IReferralsRevenueItem {
    name: string;
    user_id: number;
    amount: number;
    date: string;
}

export enum SHOWCASE_TAB {
    SCALES = 'scales',
    FOOD = 'food',
    LIFESTYLE = 'lifestyle',
}

export interface IProfileDataProps {
    username?: string;
    userId?: number;
    achievementCount?: number;
    avatar?: string;
    isPremium?: boolean;
    isBan?: boolean;
}
