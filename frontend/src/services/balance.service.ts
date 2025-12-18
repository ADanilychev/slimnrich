import { ITopUpPayload, ITopUpResponse, IWithdrawPayload } from '@/lib/types/services/balance.type';

import { API } from '@/api';

class balanceService {
    async topUpBalance({ amount, method }: ITopUpPayload): Promise<ITopUpResponse> {
        return (await API.post(`/balance/top_up?amount=${amount}&method=${method}`)).data;
    }

    async withdrawBalance({ amount, method, wallet }: IWithdrawPayload) {
        return (await API.post(`/balance/withdraw?amount=${amount}&method=${method}&wallet=${wallet}`)).data;
    }
}

export const BalanceService = new balanceService();
