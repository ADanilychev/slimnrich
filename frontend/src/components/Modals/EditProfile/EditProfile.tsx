'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Skeleton from 'react-loading-skeleton';

import Button from '@/components/UI/Button/Button';
import StandardInput from '@/components/UI/Input/StandardInput/StandardInput';

import { useModal } from '@/context/useModalContext';

import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';
import { IChangeProfilePayload, IEditProfileForm } from '@/lib/types/services/user.type';

import { EditProfileNotAvailable } from '../EditProfileNotAvailable/EditProfileNotAvailable';

import { UploaderImage } from './UploaderImage';
import { useProfile } from '@/hooks/react-queries/useProfile';
import { UserService } from '@/services/user.service';

import './editProfile.scss';

const EditProfile = () => {
    const t = useTranslations('Modals.EditProfile');

    const { togglePopup } = useModal();
    const queryClient = useQueryClient();
    const { data: profileData, isLoading } = useProfile();

    const [showPremiumModal, setShowPremiumModal] = useState(false);

    const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null | undefined>(profileData?.avatar);

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        formState: { isValid, errors, isDirty },
    } = useForm<IEditProfileForm>({
        mode: 'onChange',
        defaultValues: {
            nickname: profileData?.name,
            file: null,
        },
    });

    const { mutateAsync, isPending } = useMutation({
        mutationFn: async (payload: IChangeProfilePayload) => await UserService.changeProfile(payload),
        onError: async (error) => {
            await ApiErrorHandler(error, 'Could not edit profile!');
        },
    });

    const onSubmit: SubmitHandler<IEditProfileForm> = async (data) => {
        if (!profileData?.is_premium) {
            setShowPremiumModal(true);
            return;
        }

        await changeProfileAction();
    };

    const changeProfileAction = async (premium_only?: boolean) => {
        await mutateAsync({
            nickname: getValues('nickname'),
            premium_only: premium_only || profileData?.is_premium || false,
            file: getValues('file'),
        });
        queryClient.invalidateQueries({ queryKey: ['get-user-basic-data'] });

        togglePopup(false);
    };

    if (isLoading) return <Skeleton height={400} width={'100vw'} className="modal-dialog edit-profile-modal" />;

    return (
        <>
            {showPremiumModal && (
                <EditProfileNotAvailable
                    backAction={() => setShowPremiumModal(false)}
                    changeProfileAction={changeProfileAction}
                />
            )}
            {!showPremiumModal && (
                <div className="modal-dialog edit-profile-modal">
                    <h2>{t('Title')}</h2>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <UploaderImage
                            imagePreview={imagePreview}
                            setImagePreview={setImagePreview}
                            setValue={setValue}
                        />

                        <div className="edit-profile-modal__form">
                            <StandardInput
                                title={t('InputPlaceholder')}
                                isError={!!errors.nickname}
                                showErrorIcon={false}
                                {...register('nickname', { required: true, maxLength: 16, minLength: 4 })}
                            />
                        </div>

                        <div className="edit-profile-modal__controls">
                            <Button
                                variant={'active'}
                                type="submit"
                                disabled={!isValid || !isDirty}
                                isLoading={isPending}
                            >
                                {t('Accept')}
                            </Button>
                            <Button variant={'transparent'} onClick={() => togglePopup(false)}>
                                {t('Cancel')}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default EditProfile;
