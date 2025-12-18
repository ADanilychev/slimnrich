import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { useRouter } from '@/i18n/routing';
import { ChatService } from '@/services/chat.service';

const controller = new AbortController();

export const useChat = (chatId: number | string) => {
    const router = useRouter();

    const messageEndBlock = useRef<HTMLDivElement | null>(null);

    const query = useQuery({
        queryKey: ['get-chat-history', chatId],
        queryFn: async () => await ChatService.getHistory(chatId),
        staleTime: 60_000,
    });

    useEffect(() => {
        if (query.isError) {
            router.back();
        }
    }, [query.isError]);

    useEffect(() => {
        if (query.isFetching || query.isLoading || !messageEndBlock) return;

        setTimeout(() => messageEndBlock.current?.scrollIntoView({ behavior: 'smooth' }), 500, controller.signal);

        return () => {
            controller.abort();
        };
    }, [query.isLoading, query.isFetching]);

    return { ...query, messageEndBlock };
};
