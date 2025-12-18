import { useMutation, useQueryClient } from '@tanstack/react-query';
import { m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import React, { useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import Button from '@/components/UI/Button/Button';
import InputWithTitle from '@/components/UI/Input/InputWithTitle/InputWithTitle';
import TextAreaWithTitle from '@/components/UI/Input/TextAreaWithTitle/TextAreaWithTitle';

import { useModal } from '@/context/useModalContext';

import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';
import { IEditMetaPayload } from '@/lib/types/services/photo.type';
import { IProfileDataProps, IProfileResultItem, SHOWCASE_TAB } from '@/lib/types/services/user.type';

import { PhotoService } from '@/services/photo.service';

export default function EditForm({
    item,
    changeMode,
}: {
    item: {
        data: IProfileResultItem;
        userId: number;
        type: SHOWCASE_TAB;
        profileData: IProfileDataProps;
        isMyProfile: boolean;
    };
    changeMode: (flag: boolean) => void;
}) {
    const t = useTranslations('Modals.PhotoGalleryModal');

    const { togglePopup } = useModal();
    const queryClient = useQueryClient();
    const [_, startTransition] = useTransition();

    const {
        register,
        handleSubmit,
        formState: { isValid },
    } = useForm<IEditMetaPayload>({
        mode: 'onChange',
        defaultValues: {
            file_id: item.data.id,
            title: item.data.title,
            about: item.data.description,
        },
    });

    const { mutateAsync, isPending } = useMutation({
        mutationKey: ['edit-meta'],
        mutationFn: async (data: IEditMetaPayload) => await PhotoService.editMeta(data),
    });

    const onSubmit: SubmitHandler<IEditMetaPayload> = async (data) => {
        await mutateAsync(data, {
            onError: async (error) => {
                await ApiErrorHandler(error, 'Api error!');
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['fetch-other-profile'] });
                startTransition(() => {
                    togglePopup(false);
                });
            },
        });
    };

    return (
        <m.form
            className="edit-form"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.5 }}
            transition={{
                duration: 1.5,
            }}
            onSubmit={handleSubmit(onSubmit)}
        >
            {item.type === SHOWCASE_TAB.LIFESTYLE && (
                <div className="photo-gallery-modal__line">
                    <InputWithTitle
                        title={t('TitlePlaceholder')}
                        {...register('title', { required: true, minLength: 3, maxLength: 150 })}
                    />
                </div>
            )}

            <div className="photo-gallery-modal__line">
                <TextAreaWithTitle
                    title={t('AboutPlaceholder')}
                    rows={3}
                    {...register('about', { required: true, maxLength: 300 })}
                />
            </div>

            <div className="photo-gallery-modal__controls">
                <Button variant={'red'} onClick={() => changeMode(false)}>
                    {t('Close')}
                </Button>
                <Button variant="active" disabled={!isValid} isLoading={isPending}>
                    {t('Save')}
                </Button>
            </div>
        </m.form>
    );
}
