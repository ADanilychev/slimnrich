'use client';

import { useState } from 'react';
import { LuChevronRight } from 'react-icons/lu';
import Skeleton from 'react-loading-skeleton';

import Button from '@/components/UI/Button/Button';
import { SelectInput } from '@/components/UI/Input/SelectInput/SelectInput';

import { ADMIN_PAGE } from '@/lib/constants/admin.routes';
import { formatter } from '@/lib/helpers/format.helper';

import { useAdminBasicInfo } from '@/hooks/react-queries/useAdminBasicInfo';
import { useRouter } from '@/i18n/routing';

import '../admin-badge.scss';
import './usersStatisticsBadge.scss';

const FILTER_LIST = {
    '1 day': 60 * 60 * 24,
    '1 week': 60 * 60 * 24 * 7,
    '1 month': 2_629_746,
    '6 months': 15_638_400,
    '12 months': 31_536_000,
    'All time': 126_144_000, // 4 лет
};

export const UsersStatisticsBadge = () => {
    const router = useRouter();
    const [filterType, setFilterType] = useState(Object.keys(FILTER_LIST)[0]);

    const { data, isLoading } = useAdminBasicInfo(
        {
            start_timestamp: Math.floor(Date.now() / 1000 - FILTER_LIST[filterType as keyof typeof FILTER_LIST]),
            end_timestamp: Math.floor(Date.now() / 1000),
        },
        filterType,
    );

    return (
        <div className="admin-badge users-statistics-badge">
            <div className="admin-badge__header">
                <p className="admin-badge__title">Users statistics</p>
            </div>
            <div className="admin-badge__content">
                <div className="users-statistics-badge__top">
                    <h1>Total users:</h1>
                    {isLoading && <h2>Loading...</h2>}
                    {!isLoading && <h2>{formatter.format(data?.total_users || 0)} users</h2>}
                </div>

                <div className="users-statistics-badge__filter">
                    <SelectInput
                        title={'FILTER'}
                        data={Object.keys(FILTER_LIST)}
                        selectedElement={filterType}
                        onSelectHandler={(item) => setFilterType(item)}
                        render={(item) => <p style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>{item}</p>}
                    />
                </div>

                <div className="users-statistics-badge__stats">
                    {isLoading && <Skeleton className="users-statistics-badge__row" height={120} />}

                    {!isLoading && (
                        <>
                            <div className="users-statistics-badge__row">
                                <p>Free users:</p>
                                <b>{data?.period_free_users}</b>
                            </div>
                            <div className="users-statistics-badge__row">
                                <p>Premium users:</p>
                                <b>{data?.period_premium_users}</b>
                            </div>
                            <div className="users-statistics-badge__row">
                                <p>Bloggers invited:</p>
                                <b>{data?.bloggers_invited}</b>
                            </div>
                            <div className="users-statistics-badge__row">
                                <p>Users real balance:</p>
                                <b>{formatter.format(data?.users_real_balance || 0)}</b>
                            </div>
                            <div className="users-statistics-badge__row">
                                <p>Users bonus balance: </p>
                                <b>{formatter.format(data?.users_bonus_balance || 0)}</b>
                            </div>
                        </>
                    )}
                </div>

                <Button variant={'active'} onClick={() => router.push(ADMIN_PAGE.METRICS)}>
                    Survey Metrics
                    <LuChevronRight />
                </Button>
            </div>
        </div>
    );
};
