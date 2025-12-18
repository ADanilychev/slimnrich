import Button from '@/components/UI/Button/Button';

import { ADMIN_PAGE } from '@/lib/constants/admin.routes';
import { IChatListItem } from '@/lib/types/services/chat.type';

import { useRouter } from '@/i18n/routing';

import './chatListitem.scss';

export function ChatListitem({ item }: { item: IChatListItem }) {
    const router = useRouter();
    return (
        <div className="chat-list-item">
            <div className="chat-list-item__top">
                <p>
                    Chat № <b>{item.chat_id}</b>
                </p>
            </div>
            <div className="chat-list-item__content">
                <p>
                    Date: <b>{item.date}</b>
                </p>
                <p className={`chat-list-item__content_${item.status}`}>
                    Status: <b>{item.status}</b>
                </p>
            </div>

            <div className="chat-list-item__btn">
                <Button variant="stroke" onClick={() => router.push(ADMIN_PAGE.USER_CHAT(item.chat_id))}>
                    Reply to chat
                </Button>
            </div>
        </div>
    );
}
