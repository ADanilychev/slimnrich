import { IChatItem, IChatListItem, IMessageData, TChatListSort } from '@/lib/types/services/chat.type';

import { API } from '@/api';

class chatService {
    async getHistory(chat_id: number | string, page: number | string = 1): Promise<IChatItem[]> {
        return (await API.get(`/chat?chat_id=${chat_id}&page=${page}`)).data;
    }

    async sendMessage(data: IMessageData): Promise<{ result: boolean }> {
        return (await API.post(`/chat?chat_id=${data.chat_id}`, data)).data;
    }

    async sendPhoto(data: IMessageData): Promise<{ result: boolean }> {
        const formData = new FormData();

        if (data.file) {
            formData.append('file', data.file);
        }

        return (await API.put(`/chat`, formData)).data;
    }

    async getChatsList(sort_type: TChatListSort): Promise<IChatListItem[]> {
        return (await API.get(`/moderator/chats?sort_type=${sort_type}`)).data;
    }
}

export const ChatService = new chatService();
