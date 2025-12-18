import { BattleType } from '../configs/Battle.config';

export const ROUTES = {
    WELCOME_PAGE: (showWelcomeStories: boolean = false) =>
        `/unauthorized/welcome-page?showWelcomeStories=${showWelcomeStories}`,
    INFO: (type: 'privacy' | 'terms') => `/unauthorized/info?type=${type}`,
    STEP_BY_STEP_TEST: '/unauthorized/step-by-step-test',
    TEST_RESULT: '/unauthorized/test-result',
    BATTLE: '/battle',
    STATISTICS: '/statistics',
    EXCHANGE: '/exchange',
    PROFILE: '/profile',
    ACHIEVEMENTS: '/achievements',
    PREMIUM: '/premium',
    BALANCE_HISTORY: '/balance-history',
    SETTINGS: (type: SETTINGS_TYPE) => `/settings?type=${type}`,
    BATTLE_STATISTICS: (battle_type: BattleType) => `/battle/statistics/${battle_type}`,
    USER: (user_id: number) => `/user/${user_id}`,
    SUPPORT_CHAT: (chat_id: number) => `/support-chat/${chat_id}`,
    BAN: '/ban',
    REFERRALS: '/referrals',
    NOTIFICATIONS: '/notifications',
    POST_GIFT: (fileId: number) => `/post-gift/${fileId}`,
    NOT_SUPPORT: '/not-support',
};

export enum SETTINGS_TYPE {
    SUPPORT = 'support',
    UNITS = 'units',
    LANGUAGE = 'language',
    TIME_ZONE = 'time-zone',
    NOTIFICATIONS = 'notifications',
    RULES = 'rules',
    GET_MONEY = 'get-money',
    PRIVACY = 'privacy',
    DELETE_ACCOUNT = 'delete-account',
}

export enum SUPPORT_TAB {
    HISTORY = 'HISTORY',
    FAQ = 'FAQ',
    CHAT = 'CHAT',
}

class BattlePage {
    #base = ROUTES.BATTLE;

    BY_MYSELF = (bid: number) => `${this.#base}/by-myself?bid=${bid}`;
    PLAN = (battle_type: BattleType) => `${this.#base}/plan/${battle_type}`;
    JOIN_IN_BATTLE = (battle_type: BattleType) => `${this.#base}/join-battle/${battle_type}`;

    ONE_ON_ONE_WITH_FRIEND = (bid: number) => `${this.#base}/one-on-one-with-friend?bid=${bid}`;
    WITH_YOUR_GROUP = (bid: number) => `${this.#base}/with-your-group?bid=${bid}`;
    ONE_ON_ONE = (bid: number) => `${this.#base}/one-on-one?bid=${bid}`;
    GROUP_BY_WEIGHT = (bid: number) => `${this.#base}/group-by-weight?bid=${bid}`;
    GROUP_FOR_TIME = (bid: number) => `${this.#base}/group-for-time?bid=${bid}`;
}

export const BATTLE_PAGE = new BattlePage();
