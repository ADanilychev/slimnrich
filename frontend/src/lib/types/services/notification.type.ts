export type TNotificationGroup = 'all' | 'like' | 'referral' | 'battle';

export const enum NOTIFICATION_TABS {
    ALL = 'all',
    LIKE = 'like',
    BATTLE = 'battle',
    REFERRAL = 'referral',
}

export interface INotificationItem {
    user_id: number;
    file: string;
    amount: number;
    avatar: string;
    name: string;
    achievements_count: number;
    timestamp: number;
    id: number;
}

export interface INotificationResponse {
    total_size: string;
    like_size: string;
    referral_size: string;
    battle_size: string;
    like: INotificationItem[];
    referral: INotificationItem[];
    battle: INotificationItem[];
}
