import { IAchievementData } from '@/lib/types/services/achievement.type';
import { IUserBattlesData } from '@/lib/types/services/battles.type';
import { IReportForm } from '@/lib/types/services/report.type';
import { IStatsData } from '@/lib/types/services/stats.type';
import { IUserSettingsPayload } from '@/lib/types/services/user-settings.type';
import {
    IBasicUserData,
    IChangeProfilePayload,
    IFilterReferralsRevenue,
    IOtherProfileData,
    IReferralsData,
    IReferralsRevenueItem,
    IUserHistory,
    IUserHistoryPayload,
} from '@/lib/types/services/user.type';

import { API } from '@/api';

class userService {
    async currentAction_server(userSession: string): Promise<{ result: number }> {
        return (
            await API.get('/current-action', {
                headers: {
                    'user-session': userSession,
                },
            })
        ).data;
    }

    async checkUserRole(userSession?: string): Promise<{ result: boolean | null }> {
        if (userSession) {
            return (
                await API.get('/is_moderator', {
                    headers: {
                        'user-session': userSession,
                    },
                })
            ).data;
        }
        return (await API.get('/is_moderator')).data;
    }

    async checkAdmin(): Promise<{ result: boolean | null }> {
        return (await API.get('/is_admin')).data;
    }

    async getUserLanguage(): Promise<{ result: string }> {
        return (await API.get('/user-data/language')).data;
    }

    async userLanguage_server(userSession: string): Promise<{ result: string }> {
        return (
            await API.get('/user-data/language', {
                headers: {
                    'user-session': userSession,
                },
            })
        ).data;
    }

    async getBasicUserData(): Promise<IBasicUserData> {
        return (await API.get('/user-data/basic')).data;
    }

    async getStatsData(): Promise<IStatsData> {
        return (await API.get('/user-data/stats')).data;
    }

    async getAchievements(): Promise<IAchievementData> {
        return (await API.get('/achievements')).data;
    }

    async changeSettings(payload: IUserSettingsPayload): Promise<{ result: number }> {
        return (await API.post('/change-settings', payload)).data;
    }

    async changeProfile({ nickname, premium_only, file }: IChangeProfilePayload): Promise<{ result: number }> {
        const formData = new FormData();

        if (file) {
            formData.append('file', file);
        }

        return (await API.post(`/change-profile?nickname=${nickname}&premium_only=${premium_only}`, formData)).data;
    }

    async getBalanceHistory({
        start_timestamp = 1740000000,
        end_timestamp = Math.round(Date.now() / 1000),
        history_type = 'all',
        page = 1,
    }: IUserHistoryPayload): Promise<IUserHistory> {
        return (
            await API.get(
                `/balance-history?start_timestamp=${start_timestamp}&end_timestamp=${end_timestamp}&history_type=${history_type}&page=${page}`,
            )
        ).data;
    }

    async buyPremium({ period }: { period: 'monthly' | 'yearly' }): Promise<{ result: boolean }> {
        return (await API.post(`/buy_premium?period=${period}`)).data;
    }

    async getUserBattlesData(): Promise<IUserBattlesData> {
        return (await API.get('/user-data/battles')).data;
    }

    async getOtherProfile(userId: number | string): Promise<IOtherProfileData> {
        return (await API.get(`/open-other-profile?user_id=${userId}`)).data;
    }

    async sendReport(data: IReportForm): Promise<{ result: boolean }> {
        return (await API.post('/reports', data)).data;
    }

    async getReferralsData(): Promise<IReferralsData> {
        return (await API.get('/user-data/referrals')).data;
    }

    async getReferralsRevenue({
        balance_type,
        start_timestamp = 1740000000,
        end_timestamp = 2000000000,
        page = 1,
    }: IFilterReferralsRevenue): Promise<{ result: IReferralsRevenueItem[]; total_pages: number }> {
        return (
            await API.get(
                `/referrals-revenue?balance_type=${balance_type}&start_timestamp=${start_timestamp}&end_timestamp=${end_timestamp}&page=${page}`,
            )
        ).data;
    }

    async shareMessage(): Promise<{ result: string }> {
        return (await API.post('/user-data/stats/share')).data;
    }

    async deleteAccount(): Promise<{ result: string }> {
        return (await API.delete('/delete-account')).data;
    }
}

export const UserService = new userService();
