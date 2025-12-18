export interface IChatItem {
    id: number;
    avatar: string;
    name: string;
    chat_id: number;
    sender: number;
    text: string | null;
    file: string | null;
    timestamp: number;
}

export interface IMessageData {
    chat_id: number | string;
    text: string;
    file?: File | null;
}

export interface IChatListItem {
    chat_id: number;
    status: 'waiting' | 'answered';
    date: string;
}

export type TChatListSort = 'all' | 'waiting' | 'answered';
