'use client';

import { useQuery } from '@tanstack/react-query';

import { Metric } from '@/components/ADMIN/Metric/Metric';
import MainLoader from '@/components/MainLoader/MainLoader';

import { AdminService } from '@/services/admin.service';

import '../../../../components/ADMIN/Badges/admin-badge.scss';
import './metrics.scss';

export function Metrics() {
    const { data, isLoading } = useQuery({
        queryKey: ['fetch-admin-metrics'],
        queryFn: async () => await AdminService.getMetrics(),
    });

    if (isLoading) return <MainLoader />;

    return (
        <div className="admin-page metrics-page">
            <div className="admin-badge">
                <div className="admin-badge__header">
                    <p className="admin-badge__title">Survey Metrics</p>
                </div>

                <div className="admin-badge__content">
                    {data &&
                        Object.entries(data).map(([key, question], index) => (
                            <Metric key={key} question={question} index={index} />
                        ))}
                </div>
            </div>
        </div>
    );
}
