import { BattleType } from '@/lib/configs/Battle.config';
import {
    IBattleInfo,
    IByMySelfQuery,
    IGroupWeightQuery,
    INewBattleResponse,
    INewGroupForTimeBattleResponse,
    INewGroupWeightBattleResponse,
    INewVSFriendBattleResponse,
    INewVsOtherBattleResponse,
    INewWithYourGroupBattleResponse,
    IPlaneData,
    IVSQuery,
    IWithGroupQuery,
} from '@/lib/types/services/battles.type';

import { API } from '@/api';

class battleService {
    async getBattlePlan({
        start_weight,
        final_weight,
        period,
        battle_type,
    }: {
        start_weight: number | null;
        final_weight: number | null;
        period: number;
        battle_type: BattleType;
    }): Promise<IPlaneData> {
        return (
            await API.get(
                `/battles/get-plan?start_weight=${start_weight}&final_weight=${final_weight}&period=${period}&battle_type=${battle_type}`,
            )
        ).data;
    }

    async getBattleInfo(battle_type: BattleType): Promise<any | null> {
        if (battle_type === BattleType.BY_MYSELF) return (await API.get('/battles/bymyself')).data;
        if (battle_type === BattleType.ONE_ON_ONE_WITH_FRIENDS) return (await API.get('/battles/vsfriend')).data;
        if (battle_type === BattleType.ONE_ON_ONE) return (await API.get('/battles/vsrandom')).data;
        if (battle_type === BattleType.GROUP_FOR_TIME) return (await API.get('/battles/groupfortime')).data;
        if (battle_type === BattleType.GROUP_BY_WEIGHT) return (await API.get('/battles/groupbyweight')).data;
        if (battle_type === BattleType.WITH_YOUR_GROUP) return (await API.get('/battles/withyourgroup')).data;
        return null;
    }

    // -------------ByMyself---------------
    async createByMyself({ amount, goal, period }: IByMySelfQuery): Promise<INewBattleResponse> {
        return (await API.post(`/battles/bymyself?amount=${amount}&goal=${goal}&period=${period}`)).data;
    }

    async getByMySelfInfo(): Promise<IBattleInfo> {
        return (await API.get('/battles/bymyself')).data;
    }

    // -------------VS_Friend---------------
    async createVSFriend({ amount }: IVSQuery): Promise<INewVSFriendBattleResponse> {
        return (await API.post(`/battles/vsfriend?amount=${amount}`)).data;
    }

    async preJoinVSFriend(code: string): Promise<INewVSFriendBattleResponse> {
        return (await API.get(`/battles/vsfriend/join?code=${code}`)).data;
    }

    async joinVSFriend(code: string): Promise<INewVSFriendBattleResponse> {
        return (await API.post(`/battles/vsfriend/join?code=${code}`)).data;
    }

    async deleteVsFriend(): Promise<{ result: boolean }> {
        return (await API.delete(`/battles/vsfriend`)).data;
    }

    // -------------VS_Other---------------
    async createVSOther({ amount }: IVSQuery): Promise<INewVsOtherBattleResponse> {
        return (await API.post(`/battles/vsrandom?amount=${amount}`)).data;
    }

    // -------------Group_Time---------------
    async createGroupForTime({ amount }: IVSQuery): Promise<INewGroupForTimeBattleResponse> {
        return (await API.post(`/battles/groupfortime?amount=${amount}`)).data;
    }

    // -------------Group_Weight---------------
    async createGroupWeight({ amount, goal_size }: IGroupWeightQuery): Promise<INewGroupWeightBattleResponse> {
        return (await API.post(`/battles/groupbyweight?amount=${amount}&goal_size=${goal_size}`)).data;
    }

    // -------------WithYourGroup---------------
    async createWithYourGroup({ amount }: IWithGroupQuery): Promise<INewWithYourGroupBattleResponse> {
        return (await API.post(`/battles/withyourgroup?amount=${amount}`)).data;
    }

    async deleteWithYourGroup(): Promise<{ result: boolean }> {
        return (await API.delete('/battles/withyourgroup/control')).data;
    }

    async preWithYourGroup(code: string): Promise<INewWithYourGroupBattleResponse> {
        return (await API.get(`/battles/withyourgroup/join?code=${code}`)).data;
    }

    async joinWithYourGroup(code: string): Promise<INewWithYourGroupBattleResponse> {
        return (await API.post(`/battles/withyourgroup/join?code=${code}`)).data;
    }

    async startWithYourGroup(): Promise<{ result: boolean }> {
        return (await API.put(`/battles/withyourgroup/control`)).data;
    }
}

export const BattleService = new battleService();
