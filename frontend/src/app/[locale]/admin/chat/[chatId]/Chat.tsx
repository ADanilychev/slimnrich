'use client';

import { initData, useSignal } from '@telegram-apps/sdk-react';
import { useMemo } from 'react';
import { LuArrowLeft } from 'react-icons/lu';

import { ChatItem } from '@/components/ChatComponents/ChatItem/ChatItem';
import { ChatTextarea } from '@/components/ChatComponents/ChatTextarea/ChatTextarea';
import { ChatWrapper } from '@/components/ChatComponents/ChatWrapper/ChatWrapper';
import MainLoader from '@/components/MainLoader/MainLoader';

import { useChat } from '@/hooks/useChat';
import { useRouter } from '@/i18n/routing';

import './chatPage.scss';

export function Chat({ chatId }: { chatId: number | string }) {
    const router = useRouter();
    const userSignal = useSignal(initData.user);

    const { data: chatHistory, isLoading, messageEndBlock } = useChat(chatId);

    const senderData = useMemo(() => {
        return chatHistory?.find((m) => (userSignal?.id || 0) !== m.chat_id);
    }, [chatHistory, userSignal]);

    if (isLoading) return <MainLoader />;

    return (
        <div className="admin-page admin-chat-page">
            <header className="admin-chat-page__header">
                <button className="admin-chat-page__back" onClick={() => router.back()}>
                    <LuArrowLeft color="#fff" size={17} />
                </button>

                <div className="admin-chat-page__info">
                    {senderData && <p>id {senderData?.sender}</p>}
                    {!senderData && <p>Chat with yourself</p>}
                </div>
            </header>
            <div className="admin-page__content">
                <ChatWrapper>
                    {(chatHistory?.length || 0) > 0 &&
                        chatHistory?.map((message) => (
                            <ChatItem
                                isMe={(userSignal?.id || 0) === message.sender}
                                isAdminMode={true}
                                avatarSrc={message.avatar}
                                senderName={message.name}
                                chatItem={message}
                                key={message.id}
                            />
                        ))}
                    <div ref={messageEndBlock} />
                    <ChatTextarea chatId={chatId} />
                </ChatWrapper>
            </div>
        </div>
    );
}
