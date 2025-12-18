'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { format, getUnixTime } from 'date-fns';
import { AnimatePresence, m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Fragment, useEffect, useState } from 'react';
import { LuPlus } from 'react-icons/lu';
import { useInView } from 'react-intersection-observer';
import Skeleton from 'react-loading-skeleton';

import BalanceHistoryBadge from '@/components/Badges/BalanceHistoryBadge/BalanceHistoryBadge';
import Button from '@/components/UI/Button/Button';
import Calendar from '@/components/UI/Calendar/Calendar';
import TabMenu from '@/components/UI/TabMenu/TabMenu';

import TabTopWrapper from '@/hoc/TabTopWrapper/TabTopWrapper';

import { TBalanceHistoryType } from '@/lib/types/services/user.type';

import { UserService } from '@/services/user.service';

import './balanceHistory.scss';

interface Props {}

export function BalanceHistory({}: Props) {
    const t = useTranslations('Pages.BalanceHistoryPage');
    const [historyType, setHistoryType] = useState<TBalanceHistoryType>('all');
    const { ref, inView } = useInView();

    const [showCalendar, setShowCalendar] = useState(false);

    const [start_timestamp, setStartTimestamp] = useState<Date | undefined>(undefined);
    const [end_timestamp, setEndTimestamp] = useState<Date | undefined>(undefined);

    const {
        hasNextPage,
        fetchNextPage,
        refetch,
        data: balanceHistory,
        isLoading: isLoadingBalanceHistory,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['fetch-infinity-balance-history', historyType],
        queryFn: async ({ pageParam }) =>
            await UserService.getBalanceHistory({
                start_timestamp: (start_timestamp && getUnixTime(start_timestamp)) || 1740000000,
                end_timestamp: (end_timestamp && getUnixTime(end_timestamp)) || undefined,
                page: pageParam,
                history_type: historyType,
            }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, __, lastPageParam) => {
            if (!lastPage.total_pages) return null;
            if (lastPage.total_pages == lastPageParam) return null;
            return lastPageParam + 1;
        },
        getPreviousPageParam: (_, __, firstPageParam) => firstPageParam,
    });

    const changeHistoryType = (type: TBalanceHistoryType) => {
        setHistoryType(type);
    };

    const refetchData = () => {
        setShowCalendar(false);
        refetch();
    };

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView]);

    return (
        <div className="balance-history-page">
            <TabTopWrapper>
                <h1>{t('Title')}</h1>
                <TabMenu
                    className="balance-history-page__tabs"
                    activeLink={historyType}
                    links={[
                        {
                            text: t('Tabs.All'),
                            link: () => changeHistoryType('all'),
                            slug: 'all',
                        },
                        {
                            text: t('Tabs.Real'),
                            link: () => changeHistoryType('real'),
                            slug: 'real',
                        },
                        {
                            text: t('Tabs.Bonus'),
                            link: () => changeHistoryType('bonus'),
                            slug: 'bonus',
                        },
                        {
                            text: t('Tabs.Dates'),
                            link: () => setShowCalendar(!showCalendar),
                            slug: showCalendar,
                        },
                    ]}
                />
            </TabTopWrapper>

            <div className="main-content">
                {(start_timestamp || end_timestamp) && (
                    <div className="balance-history-page__period">
                        <p>
                            {start_timestamp ? format(start_timestamp, 'dd.MM.yyyy') : ''} -{' '}
                            {end_timestamp ? format(end_timestamp, 'dd.MM.yyyy') : ''}
                        </p>
                        <button
                            onClick={() => {
                                setStartTimestamp(undefined);
                                setEndTimestamp(undefined);

                                setTimeout(() => refetchData(), 0);
                            }}
                        >
                            <LuPlus color="#fff" size={20} style={{ transform: 'rotate(45deg)' }} />
                        </button>
                    </div>
                )}

                <div className="balance-history-page__list">
                    <AnimatePresence>
                        {showCalendar && (
                            <m.div
                                className="balance-history-page__calendar"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Calendar
                                    startDateDefault={start_timestamp}
                                    endDateDefault={end_timestamp}
                                    updateEndDate={(date) => setEndTimestamp(date || undefined)}
                                    updateStartDate={(date) => setStartTimestamp(date || undefined)}
                                />
                                <Button variant="active" onClick={refetchData}>
                                    {t('Show')}
                                </Button>
                            </m.div>
                        )}
                    </AnimatePresence>

                    {!isLoadingBalanceHistory &&
                        balanceHistory &&
                        balanceHistory.pages.map((page, pageIndex) => (
                            <Fragment key={pageIndex}>
                                {Object.entries(page.result).map(([date, items]) => (
                                    <BalanceHistoryBadge
                                        key={date}
                                        title={date}
                                        history={items}
                                        showBalanceHistoryLink={false}
                                    />
                                ))}
                            </Fragment>
                        ))}

                    {(isLoadingBalanceHistory || isFetchingNextPage) && (
                        <Skeleton className="badge balance-history-badge" height={200} />
                    )}
                    {!isFetchingNextPage && <div ref={ref} />}
                </div>
            </div>
        </div>
    );
}
