import { IGiftItem, IGiftResponse } from '@/lib/types/services/gift.type';

import { API } from '@/api';

class giftService {
    async getGifts(fileId: number): Promise<IGiftItem[]> {
        return (await API.get(`/gifts?file_id=${fileId}`)).data;
    }

    async sendGift(fileId: number): Promise<IGiftResponse> {
        return await API.post(`/gifts?file_id=${fileId}`);
    }
}

export const GiftService = new giftService();
