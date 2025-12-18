'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';

import Button from '@/components/UI/Button/Button';

import { useModal } from '@/context/useModalContext';

import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';

import { AdminService } from '@/services/admin.service';

import './unBanModal.scss';

export function UnBanModal({ user_id }: { user_id: number }) {
    const { togglePopup } = useModal();
    const queryClient = useQueryClient();

    const { mutateAsync, isPending } = useMutation({
        mutationKey: ['un-ban-user'],
        mutationFn: async (id: number) => await AdminService.unBanUser(id),
    });

    const unBanUserHandler = async () => {
        mutateAsync(user_id, {
            onSuccess: async () => {
                const { toast } = await import('react-hot-toast');
                toast.success('User is unblocked');

                queryClient.invalidateQueries({ queryKey: ['fetch-moderation-other-profile'] });
                togglePopup(false);
            },
            onError: async (error) => await ApiErrorHandler(error, 'Api error'),
        });
    };

    return (
        <div className="modal-dialog ban-modal">
            <div className="ban-modal__top">
                <Image src={'/img/ok-error.svg'} width={33} height={33} alt="error" />
                <h3>Do you want to unblock the user?</h3>
            </div>

            <div className="ban-modal__buttons">
                <Button variant="active" isLoading={isPending} onClick={unBanUserHandler}>
                    Yes, unblock user
                </Button>
                <Button variant="stroke" onClick={() => togglePopup(false)}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}
