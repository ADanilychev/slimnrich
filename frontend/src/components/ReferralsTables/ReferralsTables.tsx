'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { Table, TableBody, TableBodyCell, TableHeader, TableHeaderCell, TableRow } from '../UI/Table/Table';

import { UserService } from '@/services/user.service';

import './referralsTables.scss';

interface Props {
    isBlogger: boolean;
}

export function ReferralsTables({ isBlogger }: Props) {
    const t = useTranslations('ReferralsTables');

    const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
        queryKey: ['fetch-referrals-revenues'],
        queryFn: async ({ pageParam }) =>
            await UserService.getReferralsRevenue({
                balance_type: isBlogger ? 'real' : 'bonus',
                page: pageParam,
            }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, __, lastPageParam) => {
            if (lastPage.total_pages == lastPageParam) return null;
            return lastPageParam + 1;
        },
        getPreviousPageParam: (_, __, firstPageParam) => firstPageParam,
    });

    useEffect(() => {
        if (!isLoading && hasNextPage) fetchNextPage();
    }, [isLoading, hasNextPage]);

    const totalCount = useMemo(() => {
        return data?.pages[0].total_pages;
    }, [data]);

    if (isLoading) return <Skeleton className="referrals-tables" height={340} />;

    return (
        <div className="referrals-tables">
            <Swiper
                autoHeight={true}
                spaceBetween={5}
                pagination={{
                    el: '.swiper-pagination',
                    clickable: true,
                    type: 'custom',
                    renderCustom: function (params, className) {
                        return `<span class="custom-pagination">${params.activeIndex + 1}/${totalCount}</span>`;
                    },
                }}
                onSlideChange={(swiper) => {
                    if (!isLoading && hasNextPage && swiper.swipeDirection === 'next') fetchNextPage();
                }}
                modules={[Pagination]}
            >
                {data?.pages.map((page, index) => (
                    <SwiperSlide key={index}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHeaderCell>{t('Name')}</TableHeaderCell>
                                    <TableHeaderCell>{t('Id')}</TableHeaderCell>
                                    <TableHeaderCell>{t('Date')}</TableHeaderCell>
                                    <TableHeaderCell>{t('Reward')}</TableHeaderCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {page.result.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableBodyCell>{item.name}</TableBodyCell>
                                        <TableBodyCell>{item.user_id}</TableBodyCell>
                                        <TableBodyCell>{item.date}</TableBodyCell>
                                        <TableBodyCell>{item.amount}</TableBodyCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </SwiperSlide>
                ))}
            </Swiper>
            <div className="swiper-pagination"></div>
        </div>
    );
}
