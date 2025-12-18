import { BattleType } from '../configs/Battle.config';

class adminPage {
    private _admin = '/admin';

    INIT = this._admin;

    USERS = `${this._admin}/users`;
    BATTLES = `${this._admin}/battles`;
    BATTLE_STATISTIC = (battle_type: BattleType, battle_id: number) =>
        `${this._admin}/battles/${battle_type}/${battle_id}`;
    CHAT = `${this._admin}/chat`;

    USER_CHAT = (chat_id: number) => `${this._admin}/chat/${chat_id}`;
    USER_ADMIN = (id_user: number) => `${this.USERS}/${id_user}`;

    METRICS = `${this._admin}/metrics`;
}

export const ADMIN_PAGE = new adminPage();
