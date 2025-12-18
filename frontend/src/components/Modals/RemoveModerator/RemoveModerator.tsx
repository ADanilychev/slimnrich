'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';

import Button from '@/components/UI/Button/Button';

import { useModal } from '@/context/useModalContext';

import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';
import { IModerator } from '@/lib/types/services/admin.type';

import { useRouter } from '@/i18n/routing';
import { AdminService } from '@/services/admin.service';

import './removeModerator.scss';

export function RemoveModerator({ moderator }: { moderator: IModerator }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { togglePopup } = useModal();

    const { mutateAsync, isPending: isPendingMutate } = useMutation({
        mutationKey: ['remove-mutation'],
        mutationFn: async (id: number) => AdminService.deleteModerator(id),
    });

    const removeHandler = async () => {
        await mutateAsync(moderator.user_id, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['fetch-moderators'] });
                togglePopup(false);
            },
            onError: async (error) => ApiErrorHandler(error, 'Не удалось удалить модератора'),
        });
    };

    return (
        <div className="modal-dialog remove-moderator-modal">
            <div className="remove-moderator-modal__top">
                <Image src={'/img/ok-error.svg'} width={33} height={33} alt="error" />
                <h3>
                    Are you sure you want to remove the moderator - <b>{moderator.full_name}</b> ?
                </h3>
            </div>

            <div className="remove-moderator-modal__buttons">
                <Button variant="active" onClick={removeHandler} isLoading={isPendingMutate}>
                    Yes, remove
                </Button>
                <Button variant="stroke" onClick={() => togglePopup(false)}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}
