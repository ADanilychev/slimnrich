import { BATTLE_PAGE } from '../constants/Routes';
import { IBaseBattle } from '../types/Battle.type';

export enum BattleType {
    BY_MYSELF = 'bymyself',
    ONE_ON_ONE_WITH_FRIENDS = 'onevsfriend',
    ONE_ON_ONE = 'onevsone',
    WITH_YOUR_GROUP = 'withyourgroup',
    GROUP_FOR_TIME = 'groupfortime',
    GROUP_BY_WEIGHT = 'groupbyweight',
}

// export const BATTLE_HINT: { [key: string]: string } = {
//     [BattleType.BY_MYSELF]: 'Hint',
//     [BattleType.ONE_ON_ONE_WITH_FRIENDS]: 'Hint',
//     [BattleType.ONE_ON_ONE]: 'Hint',
//     [BattleType.WITH_YOUR_GROUP]: 'Hint',
//     [BattleType.GROUP_FOR_TIME]: 'Hint',
//     [BattleType.GROUP_BY_WEIGHT]: 'Hint',
// };

export const BattleConfig: { [key: string]: IBaseBattle } = {
    [BattleType.BY_MYSELF]: {
        type: BattleType.BY_MYSELF,
        isPrem: false,
        actionBattleButtons: false,
        accept_link: BATTLE_PAGE.BY_MYSELF,
        create_link: null,
        join_link: null,
        tutorialLink: 'https://t.me/slimandrich/49',
        // name: 'Title',
        color: '#4B68CC',
    },
    [BattleType.ONE_ON_ONE_WITH_FRIENDS]: {
        type: BattleType.ONE_ON_ONE_WITH_FRIENDS,
        isPrem: false,
        actionBattleButtons: true,
        accept_link: null,
        create_link: BATTLE_PAGE.ONE_ON_ONE_WITH_FRIEND,
        join_link: () => BATTLE_PAGE.JOIN_IN_BATTLE(BattleType.ONE_ON_ONE_WITH_FRIENDS),
        tutorialLink: 'https://t.me/slimandrich/46',
        // name: 'Title',
        color: '#D02F44',
    },
    [BattleType.ONE_ON_ONE]: {
        type: BattleType.ONE_ON_ONE,
        isPrem: true,
        actionBattleButtons: false,
        accept_link: BATTLE_PAGE.ONE_ON_ONE,
        create_link: null,
        join_link: null,
        tutorialLink: 'https://t.me/slimandrich/45',
        // name: 'Title',
        color: '#FF5473',
    },
    [BattleType.GROUP_FOR_TIME]: {
        type: BattleType.GROUP_FOR_TIME,
        isPrem: true,
        actionBattleButtons: false,
        accept_link: BATTLE_PAGE.GROUP_FOR_TIME,
        create_link: null,
        join_link: null,
        tutorialLink: 'https://t.me/slimandrich/47',
        // name: 'Group for time',
        color: '#FFAE35',
    },
    [BattleType.WITH_YOUR_GROUP]: {
        type: BattleType.WITH_YOUR_GROUP,
        isPrem: true,
        actionBattleButtons: true,
        accept_link: null,
        create_link: BATTLE_PAGE.WITH_YOUR_GROUP,
        join_link: () => BATTLE_PAGE.JOIN_IN_BATTLE(BattleType.WITH_YOUR_GROUP),
        tutorialLink: 'https://t.me/slimandrich/50',
        // name: 'Title',
        color: '#19BA5F',
    },
    [BattleType.GROUP_BY_WEIGHT]: {
        type: BattleType.GROUP_BY_WEIGHT,
        isPrem: true,
        actionBattleButtons: false,
        accept_link: BATTLE_PAGE.GROUP_BY_WEIGHT,
        create_link: null,
        join_link: null,
        tutorialLink: 'https://t.me/slimandrich/48',
        // name: 'Title',
        color: '#AD71FF',
    },
} as const;
