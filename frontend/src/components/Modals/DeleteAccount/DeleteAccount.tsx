'use client';

import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import Button from '@/components/UI/Button/Button';

import { useModal } from '@/context/useModalContext';

import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';

import { UserService } from '@/services/user.service';

import './deleteAccount.scss';

export function DeleteAccount() {
    const t = useTranslations('Modals.DeleteAccount');

    const { togglePopup } = useModal();

    const { mutate, isPending } = useMutation({
        mutationKey: ['delete-account'],
        mutationFn: async () => await UserService.deleteAccount(),
        onSuccess: async () => {
            const { toast } = await import('react-hot-toast');
            toast.success('Account successfully deleted');
            togglePopup(false);
        },
        onError: async (error) => await ApiErrorHandler(error, 'Api error'),
    });

    return (
        <div className="modal-dialog delete-account-modal">
            <div className="delete-account-modal__top">
                <Image src={'/img/ok-error.svg'} width={33} height={33} alt="error" />
                <h3>{t('Title')}</h3>
            </div>

            <div className="delete-account-modal__buttons">
                <Button variant="active" isLoading={isPending} onClick={() => mutate()}>
                    {t('Yes')}
                </Button>
                <Button variant="stroke" onClick={() => togglePopup(false)}>
                    {t('Cancel')}
                </Button>
            </div>
        </div>
    );
}
