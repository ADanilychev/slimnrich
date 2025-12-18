import {
    IAddBloggerForm,
    IAdminBasicInfo,
    IAdminMetrics,
    IBanForm,
    IBlogger,
    IFormAddModerator,
    IGetBattleFilter,
    IModerator,
    IUserProfileData,
    IWalletInfo,
    IWithdrawForm,
} from '@/lib/types/services/admin.type';
import { IAdminInfoBattle } from '@/lib/types/services/battles.type';

import { API } from '@/api';

class adminService {
    private _base = '/admin';

    async getBasicInfo({
        start_timestamp = 1740000000,
        end_timestamp = 2000000000,
    }: {
        start_timestamp?: number;
        end_timestamp?: number;
    }): Promise<IAdminBasicInfo> {
        return (
            await API.get(this._base + `/basic-info?start_timestamp=${start_timestamp}&end_timestamp=${end_timestamp}`)
        ).data;
    }

    async getMetrics(): Promise<IAdminMetrics> {
        return (await API.get(this._base + '/metrics')).data;
    }

    async getModerators(): Promise<IModerator[]> {
        return (await API.get(this._base + '/moderators')).data;
    }

    async deleteModerator(moderator_id: number): Promise<IModerator[]> {
        return (await API.delete(this._base + `/moderators?moderator_id=${moderator_id}`)).data;
    }

    async createModerator({ new_moderator, full_name }: IFormAddModerator): Promise<IModerator> {
        return (await API.post(this._base + `/moderators?new_moderator=${new_moderator}&full_name=${full_name}`)).data;
    }

    async getUser(user_id: string | number): Promise<IUserProfileData> {
        return (await API.get(`/moderator/get-user?user_id=${user_id}`)).data;
    }

    async setBanUser({ period, violator_id }: IBanForm): Promise<{ result: boolean }> {
        return (await API.post(`/moderator/ban?period=${period}&violator_id=${violator_id}`)).data;
    }

    async unBanUser(user_id: string | number): Promise<IUserProfileData> {
        return (await API.delete(`/moderator/ban?user_id=${user_id}`)).data;
    }

    async getBloggers(): Promise<IBlogger[]> {
        return (await API.get(this._base + '/bloggers')).data;
    }

    async addBlogger({ user_id, promo_code, revenue_percent }: IAddBloggerForm): Promise<{ result: boolean }> {
        return (
            await API.post(
                this._base + `/bloggers?user_id=${user_id}&promo_code=${promo_code}&revenue_percent=${revenue_percent}`,
            )
        ).data;
    }

    async removeBlogger(user_id: number | string): Promise<{ result: boolean }> {
        return (await API.delete(this._base + `/bloggers?user_id=${user_id}`)).data;
    }

    async getWalletsInfo(): Promise<IWalletInfo[]> {
        return (await API.get(this._base + '/wallets')).data;
    }

    async walletWithdraw({ method, amount }: IWithdrawForm): Promise<{ result: boolean }> {
        return (await API.put(this._base + `/wallets?method=${method}&amount=${amount}`)).data;
    }

    async getBattles({ battle_id, battle_type }: IGetBattleFilter): Promise<IAdminInfoBattle[]> {
        let queryString = '';
        if (battle_id && battle_type) {
            queryString += `?battle_id=${battle_id}`;
            queryString += `&battle_type=${battle_type}`;
        }

        return (await API.get(this._base + `/battles${queryString}`)).data;
    }
}

export const AdminService = new adminService();
