import { INotificationItem } from './notification.type';

// export type IGiftItem = Omit<INotificationItem, 'file' | 'achievements_count' | 'timestamp' | 'id'>;

export interface IGiftItem extends INotificationItem {}

export interface IGiftResponse {
    is_premium: boolean;
    balance: number;
    bonus_balance: number;
    frozen_total_balance: number;
    timestamp: number;
}
