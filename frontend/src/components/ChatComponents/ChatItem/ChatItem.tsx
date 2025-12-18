import { format, fromUnixTime } from 'date-fns';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useMemo } from 'react';

import { IChatItem } from '@/lib/types/services/chat.type';

import './chatItem.scss';

export function ChatItem({
    isMe = false,
    chatItem,
    isAdminMode = false,
    avatarSrc,
    senderName,
}: {
    isMe?: boolean;
    chatItem: IChatItem;
    isAdminMode?: boolean;
    avatarSrc?: string;
    senderName?: string;
}) {
    const t = useTranslations('Pages.ChatPage');
    const date = useMemo(() => fromUnixTime(chatItem.timestamp), []);

    return (
        <div className={`chat-message ${isMe ? 'me-message' : ''}`}>
            {!isMe && !isAdminMode && <Image src={'/img/achievements/fox.svg'} width={40} height={40} alt="logo" />}
            {!isMe && isAdminMode && (
                <Image
                    src={avatarSrc || '/img/achievements/fox.svg'}
                    className="chat-message__avatar"
                    width={40}
                    height={40}
                    alt="logo"
                />
            )}
            <div className="chat-message__wrapper">
                {!isMe && !isAdminMode && <p className="chat-message__user">{t('Assistant')}</p>}
                {!isMe && isAdminMode && <p className="chat-message__user">{senderName}</p>}

                {chatItem.text && <p className="chat-message__text">{chatItem.text}</p>}
                {chatItem.file && (
                    <div className="chat-message__file">
                        <Image src={chatItem.file} width={1000} height={1000} alt={'img'} loading="eager" priority />
                    </div>
                )}
                <small>{format(date, 'yyyy/MM/dd HH:mm')}</small>
            </div>
        </div>
    );
}
