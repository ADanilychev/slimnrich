export interface IAchievementItem {
    favicon: string;
    title: string;
    subtitle: string;
}

export interface IAchievementItemWithStatus extends IAchievementItem {
    has_achievement: boolean;
}

export interface IAchievementData {
    pre_page: IAchievementItemWithStatus[];
    pages: {
        has: IAchievementItem[];
        available: IAchievementItem[];
    }[];
    timestamp: number;
    total_count: number;
}
