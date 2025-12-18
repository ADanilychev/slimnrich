'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Skeleton from 'react-loading-skeleton';

import { SelectInput } from '@/components/UI/Input/SelectInput/SelectInput';

import { TChatListSort } from '@/lib/types/services/chat.type';

import { ChatListitem } from './ChatListitem/ChatListitem';
import { ChatService } from '@/services/chat.service';

import '../admin-badge.scss';
import './chatsBadge.scss';

const SORT_LIST: TChatListSort[] = ['all', 'answered', 'waiting'];

export const ChatsBadge = () => {
    const [sortType, setSortType] = useState<TChatListSort>(SORT_LIST[0]);

    const { data, isLoading } = useQuery({
        queryKey: ['fetch-moderation-chats-list', sortType],
        queryFn: async () => {
            return await ChatService.getChatsList(sortType);
        },
    });

    return (
        <div className="admin-badge chats-badge">
            <div className="admin-badge__header">
                <p className="admin-badge__title">Chats</p>
            </div>
            <div className="admin-badge__content">
                <div className="chats-badge__filter">
                    <SelectInput
                        title={'FILTER'}
                        data={SORT_LIST}
                        selectedElement={sortType.toUpperCase() as TChatListSort}
                        onSelectHandler={(item: TChatListSort) => setSortType(item)}
                        render={(item) => (
                            <p style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>{item.toUpperCase()}</p>
                        )}
                    />
                </div>
                <div className="chats-badge__wrapper">
                    {isLoading && (
                        <>
                            {Array(3)
                                .fill(0)
                                .map((_, index) => (
                                    <Skeleton height={130} key={index} />
                                ))}
                        </>
                    )}
                    {!isLoading && data?.map((chat) => <ChatListitem item={chat} key={chat.chat_id} />)}
                </div>
            </div>
        </div>
    );
};
