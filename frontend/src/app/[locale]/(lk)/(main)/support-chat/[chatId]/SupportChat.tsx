'use client';

import { initData, useSignal } from '@telegram-apps/sdk-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { ChatItem } from '@/components/ChatComponents/ChatItem/ChatItem';
import { ChatTextarea } from '@/components/ChatComponents/ChatTextarea/ChatTextarea';
import { ChatWrapper } from '@/components/ChatComponents/ChatWrapper/ChatWrapper';
import MainLoader from '@/components/MainLoader/MainLoader';

import TabTopWrapper from '@/hoc/TabTopWrapper/TabTopWrapper';

import { useChat } from '@/hooks/useChat';

import './supportChat.scss';

export function SupportChat({ chatId }: { chatId: number | string }) {
    const t = useTranslations('Pages.ChatPage');

    const userSignal = useSignal(initData.user);

    const { data: chatHistory, isLoading, messageEndBlock } = useChat(chatId);

    if (isLoading) return <MainLoader />;

    return (
        <div className="support-chat-page">
            <TabTopWrapper>
                <Image src={'/img/achievements/fox.svg'} width={60} height={60} alt="logo" />
                <div className="support-chat-page__top">
                    <h1>{t('Title')}</h1>
                    <p>{t('Subtitle')}</p>
                </div>
            </TabTopWrapper>
            <div className="main-content">
                <ChatWrapper>
                    {(chatHistory?.length || 0) > 0 &&
                        chatHistory?.map((message) => (
                            <ChatItem
                                isMe={(userSignal?.id || 0) === message.sender}
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
