import { BattleType } from '@/lib/configs/Battle.config';
import { INumberSystem } from '@/lib/constants/NumberSystem';

export interface IUserBattlesData {
    max_kg: number[];
    max_lb: number[];
    battles_data: {
        bymyself: IBattlesDataItem;
        onevsfriend: IBattlesDataItem;
        onevsone: IBattlesDataItem;
        groupfortime: IBattlesDataItem;
        withyourgroup: IBattlesDataItem;
        groupbyweight: IBattlesDataItem;
    };
    timestamp: number;
}

export interface IBattlesDataItem {
    status: TBattleStatus;
    reached: number;
    goal: number;
    start_date: string;
    end_date: string;
    participants: number;
}

export enum BattleStatusEnum {
    NEW = 'new',
    WON = 'won',
    LOST = 'lost',
    CONTINUE = 'continue',
    WAITING = 'waiting',
}

export type TBattleStatus = 'new' | 'won' | 'lost' | 'continue' | 'waiting';
export type TBattleAlerts = 'charity' | 'motivation';

export type TBattleResponse<T extends BattleType> = T extends BattleType.BY_MYSELF
    ? INewBattleResponse
    : T extends BattleType.ONE_ON_ONE_WITH_FRIENDS
      ? INewVSFriendBattleResponse
      : never;

export interface INewBattleResponse {
    progress: (boolean | null)[];
    money_progress: (number | null)[];
    reached: number;
    goal: number;
    status: TBattleStatus;
    results: number[];
    needed_results: number;
    alerts: TBattleAlerts[];
    start_date: string;
    end_date: string;
}

export interface INewVSFriendBattleResponse extends INewBattleResponse {
    is_owner: boolean;
    battle_code: string;
    participants: IBattleParticipant[];
    start_timestamp: number;
    end_timestamp: number;
    amount: number;
}

export interface IAdminInfoBattle extends INewVSFriendBattleResponse {
    title: string;
    id: number;
}

export interface INewVsOtherBattleResponse extends INewVSFriendBattleResponse {}
export interface INewGroupForTimeBattleResponse extends INewVSFriendBattleResponse {}
export interface INewGroupWeightBattleResponse extends INewVSFriendBattleResponse {}
export interface INewWithYourGroupBattleResponse extends INewVSFriendBattleResponse {
    is_accepted: boolean;
}

export interface IByMySelfQuery {
    amount: number;
    period: number;
    goal: number;
}

export interface IVSQuery {
    amount: number;
}

export interface IGroupWeightQuery {
    amount: number;
    goal_size: 0.5 | 1 | 1.5 | 2;
}

export interface IWithGroupQuery {
    amount: number;
}

export interface IBattleInfo extends INewBattleResponse {}

export interface IPlaneData {
    graph: number[];
    amount: number;
    goal: number;
    period: number;
    numbers: INumberSystem;
}

export interface IBattleParticipant {
    name: string;
    avatar: string;
    user_id: number;
    achievements_count: number;
    weight_kg: number;
    its_you: boolean;
}
