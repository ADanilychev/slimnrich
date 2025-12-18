'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Skeleton from 'react-loading-skeleton';

import { SelectInput } from '@/components/UI/Input/SelectInput/SelectInput';

import { TReportFilterType } from '@/lib/types/services/report.type';

import { AdminReportItem } from '../../AdminReportItem/AdminReportItem';

import { ReportService } from '@/services/report.service';

import '../admin-badge.scss';
import './reportsBadge.scss';

const FILTER_LIST: TReportFilterType[] = ['all', 'consideration', 'ended'];

export const ReportsBadge = () => {
    const [filterType, setFilterType] = useState<TReportFilterType>(FILTER_LIST[0]);

    const { data, isLoading } = useQuery({
        queryKey: ['fetch-moderation-user-reports', filterType],
        queryFn: async () => await ReportService.getReportsData({ moderation_mode: true, status: filterType }),
    });

    return (
        <div className="admin-badge reports-badge">
            <div className="admin-badge__header">
                <p className="admin-badge__title">Reports on users</p>
            </div>
            <div className="admin-badge__content">
                <div className="reports-badge__filter">
                    <SelectInput
                        title={'FILTER'}
                        data={FILTER_LIST}
                        selectedElement={filterType.toUpperCase() as TReportFilterType}
                        onSelectHandler={(item: TReportFilterType) => setFilterType(item)}
                        render={(item) => (
                            <p style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>{item.toUpperCase()}</p>
                        )}
                    />
                </div>
                <div className="reports-badge__wrapper">
                    {isLoading && (
                        <>
                            {Array(3)
                                .fill(0)
                                .map((_, index) => (
                                    <Skeleton height={230} key={index} />
                                ))}
                        </>
                    )}
                    {!isLoading && data?.map((report) => <AdminReportItem key={report.id} report={report} />)}
                </div>
            </div>
        </div>
    );
};
