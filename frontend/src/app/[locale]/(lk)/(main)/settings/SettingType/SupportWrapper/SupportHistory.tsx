'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { LuArrowLeft, LuArrowRight } from 'react-icons/lu';
import Skeleton from 'react-loading-skeleton';

import { ReportItem } from '@/components/ReportItem/ReportItem';
import TabMenu from '@/components/UI/TabMenu/TabMenu';

import { IReportDataItem, TReportFilterType } from '@/lib/types/services/report.type';

import { ReportService } from '@/services/report.service';

const PAGINATE_SIZE = 5;

export function SupportHistory() {
    const t = useTranslations('Pages.SupportPage');
    const [currentPage, setCurrentPage] = useState(1);
    const [filterType, setFilterType] = useState<TReportFilterType>('all');

    const { data, isLoading } = useQuery({
        queryKey: ['fetch-user-reports', filterType],
        queryFn: async () => await ReportService.getReportsData({ moderation_mode: false, status: filterType }),
    });

    const paginateData = useMemo(() => {
        if (!data?.length) return {};

        const response: { [page: string]: IReportDataItem[] } = {};
        let page = 1;

        data.forEach((item) => {
            if (!response[page]) {
                response[page] = [];
            }

            if (response[page].length >= PAGINATE_SIZE) {
                page += 1;
                response[page] = [];
            }

            response[page].push(item);
        });

        return response;
    }, [data]);

    const totalPages = useMemo(() => {
        return Object.keys(paginateData).length;
    }, [paginateData]);

    const nextHandler = (direction: 'next' | 'prev') => {
        if ((direction === 'prev' && currentPage === 1) || (direction === 'next' && currentPage === totalPages)) return;

        setCurrentPage((prev) => (direction === 'next' ? prev + 1 : prev - 1));
    };

    const setFilterHandler = (type: TReportFilterType) => {
        setCurrentPage(1);
        setFilterType(type);
    };

    return (
        <div className="support-history  main-content">
            <div className="support-history__top">
                <TabMenu
                    activeLink={filterType}
                    links={[
                        {
                            text: t('ReportTabs.All'),
                            link: () => setFilterHandler('all'),
                            slug: 'all',
                        },
                        {
                            text: t('ReportTabs.Consideration'),
                            link: () => setFilterHandler('consideration'),
                            slug: 'consideration',
                        },
                        {
                            text: t('ReportTabs.Ended'),
                            link: () => setFilterHandler('ended'),
                            slug: 'ended',
                        },
                    ]}
                />
            </div>

            <div className="support-history__content">
                {isLoading ? (
                    <>
                        {Array(3)
                            .fill(0)
                            .map((_, index) => (
                                <Skeleton height={120} key={index} />
                            ))}
                    </>
                ) : (
                    <>
                        {Object.keys(paginateData)?.length == 0 && <p className="empty-tab">{t('EmptyTab')}</p>}
                        {(Object.keys(paginateData)?.length || 0) > 0 &&
                            paginateData[currentPage].map((item) => <ReportItem key={item.id} report={item} />)}
                    </>
                )}
            </div>
            {(Object.keys(paginateData)?.length || 0) > 0 && totalPages > 1 && (
                <div className="support-history__controls">
                    <button disabled={currentPage === 1} onClick={() => nextHandler('prev')}>
                        <LuArrowLeft color="#fff" size={20} />
                    </button>

                    <button disabled={currentPage === totalPages} onClick={() => nextHandler('next')}>
                        <LuArrowRight color="#fff" size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
