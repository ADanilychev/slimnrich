'use client';

import { useQuery } from '@tanstack/react-query';
import React from 'react';

import GiftsPostBadge from '@/components/Badges/GiftsPostBadge/GiftsPostBadge';
import MainLoader from '@/components/MainLoader/MainLoader';

import { GiftService } from '@/services/gift.service';

import './postGift.scss';

export default function PostGiftPage({ file_id }: { file_id: string }) {
    const { data, isLoading } = useQuery({
        queryKey: ['post-gift'],
        queryFn: async () => await GiftService.getGifts(file_id ? parseInt(file_id) : 0),
    });

    if (isLoading) return <MainLoader />;

    return (
        <div className="post-gift-page">
            <div className="main-content">
                <GiftsPostBadge data={data || []} />
            </div>
        </div>
    );
}
