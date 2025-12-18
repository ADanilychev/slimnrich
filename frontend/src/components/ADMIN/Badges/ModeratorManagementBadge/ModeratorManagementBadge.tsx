'use client';

import { useQuery } from '@tanstack/react-query';
import { LuX } from 'react-icons/lu';
import Skeleton from 'react-loading-skeleton';

import Button from '@/components/UI/Button/Button';

import { useModal } from '@/context/useModalContext';

import { ADMIN_PAGE } from '@/lib/constants/admin.routes';
import { PopupTypes } from '@/lib/types/ModalContext.type';

import { useRouter } from '@/i18n/routing';
import { AdminService } from '@/services/admin.service';

import '../admin-badge.scss';
import './moderatorManagementBadge.scss';

export const ModeratorManagementBadge = () => {
    const router = useRouter();
    const { togglePopup } = useModal();

    const { data, isLoading } = useQuery({
        queryKey: ['fetch-moderators'],
        queryFn: async () => AdminService.getModerators(),
    });

    if (isLoading) return <Skeleton height={300} className="admin-badge moderator-management-badge" />;

    return (
        <div className="admin-badge moderator-management-badge">
            <div className="admin-badge__header">
                <p className="admin-badge__title">Moderator management</p>
            </div>
            <div className="admin-badge__content">
                <div className="moderator-management-badge__list">
                    {data?.map((item) => (
                        <div className="moderator-management-badge__row" key={item.id}>
                            <p>
                                {item.full_name} <b>(id{item.user_id})</b>
                            </p>
                            <span onClick={() => togglePopup(true, PopupTypes.RemoveModerator, item)}>
                                <LuX size={17} /> Delete
                            </span>
                        </div>
                    ))}
                </div>
                <Button variant={'active'} onClick={() => togglePopup(true, PopupTypes.AddModerator)}>
                    Add moderator
                </Button>
            </div>
        </div>
    );
};
