import { useMutation } from '@tanstack/react-query';
import { shareMessage } from '@telegram-apps/sdk-react';
import { useTranslations } from 'next-intl';
import { SubmitHandler, useForm } from 'react-hook-form';

import Button from '@/components/UI/Button/Button';
import TextAreaWithTitle from '@/components/UI/Input/TextAreaWithTitle/TextAreaWithTitle';

import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';

import { PhotoService } from '@/services/photo.service';

import './createUniqueRepost.scss';

interface IForm {
    text: string;
}

export function CreateUniqueRepost({ fileId }: { fileId: number }) {
    const t = useTranslations('Modals.CreateUniqueRepost');

    const { mutateAsync, isPending } = useMutation({
        mutationKey: ['share-photo-admin'],
        mutationFn: async (data: { fileId: number; text: string }) =>
            await PhotoService.sharePhoto(data.fileId, data.text),
        onError: async (error: any) => await ApiErrorHandler(error, 'Api error!'),
    });

    const {
        register,
        formState: { isValid },
        handleSubmit,
    } = useForm<IForm>({
        mode: 'onChange',
        defaultValues: {
            text: '',
        },
    });

    const sharePhotoAdminHandler: SubmitHandler<IForm> = async ({ text }) => {
        const { result } = await mutateAsync({
            fileId,
            text,
        });

        if (shareMessage.isAvailable()) {
            await shareMessage(result);
        }
    };

    const sharePhotoDefaultHandler = async () => {
        const { result } = await mutateAsync({
            fileId,
            text: '',
        });

        if (shareMessage.isAvailable()) {
            await shareMessage(result);
        }
    };

    return (
        <div className="modal-dialog create-unique-repost">
            <form onSubmit={handleSubmit(sharePhotoAdminHandler)}>
                <h2>{t('Title')}</h2>
                <div className="create-unique-repost__form">
                    <TextAreaWithTitle
                        row={3}
                        title={t('Placeholder')}
                        {...register('text', { required: true, minLength: 1, maxLength: 1024 })}
                    />
                </div>

                <div className="create-unique-repost__controls">
                    <Button variant={'active'} type="submit" disabled={!isValid} isLoading={isPending}>
                        {t('AdminButton')}
                    </Button>
                    <Button variant={'stroke'} type="button" onClick={sharePhotoDefaultHandler} isLoading={isPending}>
                        {t('DefaultButton')}
                    </Button>
                </div>
            </form>
        </div>
    );
}
