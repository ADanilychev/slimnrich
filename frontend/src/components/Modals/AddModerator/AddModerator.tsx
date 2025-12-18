'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SubmitHandler, useForm } from 'react-hook-form';

import Button from '@/components/UI/Button/Button';
import InputWithTitle from '@/components/UI/Input/InputWithTitle/InputWithTitle';

import { useModal } from '@/context/useModalContext';

import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';
import { IFormAddModerator } from '@/lib/types/services/admin.type';

import { AdminService } from '@/services/admin.service';

import './addModerator.scss';

export function AddModerator() {
    const queryClient = useQueryClient();
    const { togglePopup } = useModal();

    const {
        register,
        handleSubmit,
        formState: { isValid },
    } = useForm<IFormAddModerator>({
        mode: 'onChange',
    });

    const { mutateAsync, isPending } = useMutation({
        mutationKey: ['create-moderator'],
        mutationFn: async (payload: IFormAddModerator) => AdminService.createModerator(payload),
    });

    const onSubmit: SubmitHandler<IFormAddModerator> = async (data) => {
        await mutateAsync(data, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['fetch-moderators'] });
                togglePopup(false);
            },
            onError: async (error) => await ApiErrorHandler(error, 'Error'),
        });
    };

    return (
        <div className="modal-dialog add-moderator-modal">
            <div className="add-moderator-modal__top">
                <h3>Add new moderator</h3>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="add-moderator-modal__content">
                    <InputWithTitle
                        title={'Enter user ID in Telegram'}
                        inputMode="numeric"
                        type="number"
                        {...register('new_moderator', { required: true, minLength: 4 })}
                    />
                    <InputWithTitle
                        title={'Enter user fullname'}
                        {...register('full_name', { required: true, minLength: 3, maxLength: 16 })}
                    />
                </div>

                <div className="add-moderator-modal__buttons">
                    <Button variant="active" type="submit" disabled={!isValid} isLoading={isPending}>
                        Add moderator
                    </Button>
                    <Button variant="stroke" type="button" onClick={() => togglePopup(false)}>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
