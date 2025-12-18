'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SubmitHandler, useForm } from 'react-hook-form';

import Button from '@/components/UI/Button/Button';
import InputWithTitle from '@/components/UI/Input/InputWithTitle/InputWithTitle';

import { useModal } from '@/context/useModalContext';

import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';
import { IAddBloggerForm } from '@/lib/types/services/admin.type';

import { AdminService } from '@/services/admin.service';

import './addBlogger.scss';

export function AddBlogger() {
    const queryClient = useQueryClient();
    const { togglePopup } = useModal();

    const {
        register,
        handleSubmit,
        formState: { isValid, errors },
    } = useForm<IAddBloggerForm>({
        mode: 'onChange',
    });

    const { mutateAsync, isPending } = useMutation({
        mutationKey: ['add-blogger'],
        mutationFn: async (payload: IAddBloggerForm) => AdminService.addBlogger(payload),
    });

    const onSubmit: SubmitHandler<IAddBloggerForm> = async (data) => {
        await mutateAsync(data, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['fetch-bloggers'] });
                togglePopup(false);
            },
            onError: async (error) => await ApiErrorHandler(error, 'Error'),
        });
    };

    return (
        <div className="modal-dialog add-blogger-modal">
            <div className="add-blogger-modal__top">
                <h3>Add blogger</h3>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="add-blogger-modal__content">
                    <InputWithTitle
                        title={'ID Telegram'}
                        inputMode="numeric"
                        type="number"
                        {...register('user_id', { required: true, minLength: 4 })}
                    />
                    <InputWithTitle
                        title={'Promo code'}
                        {...register('promo_code', { required: true, minLength: 4, maxLength: 16 })}
                    />
                    <InputWithTitle
                        title={'Payout percentage'}
                        type="number"
                        inputMode="numeric"
                        isError={!!errors.revenue_percent}
                        showErrorIcon={false}
                        {...register('revenue_percent', { required: true, valueAsNumber: true, max: 50, min: 1 })}
                    />
                </div>

                <div className="add-blogger-modal__buttons">
                    <Button variant="active" type="submit" disabled={!isValid} isLoading={isPending}>
                        Add blogger
                    </Button>
                    <Button variant="stroke" type="button" onClick={() => togglePopup(false)}>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
