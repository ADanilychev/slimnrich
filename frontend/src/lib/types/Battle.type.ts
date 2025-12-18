import { BattleType } from '../configs/Battle.config';

export interface IBaseBattle {
    type: BattleType;
    isPrem: boolean;
    actionBattleButtons: boolean;
    accept_link: ((bid: number) => string) | null;
    create_link: ((bid: number) => string) | null;
    join_link: (() => string) | null;
    tutorialLink?: string;
    // name: string;
    color: string;
}
