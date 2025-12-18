'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';

import Button from '@/components/UI/Button/Button';

import { useModal } from '@/context/useModalContext';

import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';
import { IBlogger } from '@/lib/types/services/admin.type';

import { AdminService } from '@/services/admin.service';

import './removeBlogger.scss';

export function RemoveBlogger({ blogger }: { blogger: IBlogger }) {
    const queryClient = useQueryClient();
    const { togglePopup } = useModal();

    const { mutateAsync, isPending: isPendingMutate } = useMutation({
        mutationKey: ['remove-blogger'],
        mutationFn: async (id: number) => AdminService.removeBlogger(id),
    });

    const removeHandler = async () => {
        await mutateAsync(blogger.user_id, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['fetch-bloggers'] });
                togglePopup(false);
            },
            onError: async (error) => ApiErrorHandler(error, 'Не удалось удалить блогера'),
        });
    };

    return (
        <div className="modal-dialog remove-blogger-modal">
            <div className="remove-blogger-modal__top">
                <Image src={'/img/ok-error.svg'} width={33} height={33} alt="error" />
                <h3>
                    Are you sure you want to remove the blogger - <b>{blogger.name}</b> ?
                </h3>
            </div>

            <div className="remove-blogger-modal__buttons">
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
