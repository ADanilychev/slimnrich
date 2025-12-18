'use client';

import { useQuery } from '@tanstack/react-query';
import Skeleton from 'react-loading-skeleton';

import Button from '@/components/UI/Button/Button';
import { Table, TableBody, TableBodyCell, TableHeader, TableHeaderCell, TableRow } from '@/components/UI/Table/Table';

import { useModal } from '@/context/useModalContext';

import { formatter } from '@/lib/helpers/format.helper';
import { PopupTypes } from '@/lib/types/ModalContext.type';

import { AdminService } from '@/services/admin.service';

import '../admin-badge.scss';
import './referralsManagementBadge.scss';

interface Props {}

export function ReferralsManagement({}: Props) {
    const { togglePopup } = useModal();

    const { data, isLoading } = useQuery({
        queryKey: ['fetch-bloggers'],
        queryFn: async () => await AdminService.getBloggers(),
    });

    if (isLoading) return <Skeleton className="admin-badge referrals-management" height={250} />;

    return (
        <div className="admin-badge referrals-management">
            <div className="admin-badge__header">
                <p className="admin-badge__title">Referrals management:</p>
            </div>
            <div className="admin-badge__content">
                <div className="referrals-management__table">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHeaderCell>Name</TableHeaderCell>
                                <TableHeaderCell>Balance</TableHeaderCell>
                                <TableHeaderCell>%</TableHeaderCell>
                                <TableHeaderCell>Qty</TableHeaderCell>
                                <TableHeaderCell>ID</TableHeaderCell>
                                <TableHeaderCell>Promo</TableHeaderCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.map((blogger) => (
                                <TableRow key={blogger.user_id}>
                                    <TableBodyCell>
                                        <span
                                            className="blogger-name"
                                            onClick={() => togglePopup(true, PopupTypes.RemoveBlogger, blogger)}
                                        >
                                            {blogger.name}
                                        </span>
                                    </TableBodyCell>
                                    <TableBodyCell>{formatter.format(blogger.balance)}</TableBodyCell>
                                    <TableBodyCell>{blogger.revenue_percent}%</TableBodyCell>
                                    <TableBodyCell>{blogger.referrals_count}</TableBodyCell>
                                    <TableBodyCell>{blogger.user_id}</TableBodyCell>
                                    <TableBodyCell>{blogger.promo_code}</TableBodyCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="referrals-management__footer">
                    <Button variant="active" onClick={() => togglePopup(true, PopupTypes.AddBlogger)}>
                        Add blogger
                    </Button>
                </div>
            </div>
        </div>
    );
}
