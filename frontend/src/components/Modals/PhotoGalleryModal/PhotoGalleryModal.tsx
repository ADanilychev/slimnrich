import { useMutation } from '@tanstack/react-query';
import { shareMessage } from '@telegram-apps/sdk-react';
import { AnimatePresence, m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';

import { UserFrame } from '@/components/UserFrame/UserFrame';

import { useModal } from '@/context/useModalContext';

import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';
import { PopupTypes } from '@/lib/types/ModalContext.type';
import { IProfileDataProps, IProfileResultItem, SHOWCASE_TAB } from '@/lib/types/services/user.type';

import EditForm from './EditForm/EditForm';
import ViewForm from './ViewForm/ViewForm';
import { useAdmin } from '@/hooks/react-queries/useAdmin';
import { PhotoService } from '@/services/photo.service';

import './photoGalleryModal.scss';

export function PhotoGalleryModal({
    item,
}: {
    item: {
        data: IProfileResultItem;
        userId: number;
        type: SHOWCASE_TAB;
        profileData: IProfileDataProps;
        isMyProfile: boolean;
    };
}) {
    const t = useTranslations('Modals.PhotoGalleryModal');
    const { togglePopup } = useModal();
    const [isEditMode, setIsEditMode] = useState(false);

    const { data: isAdminData, isLoading } = useAdmin();

    const { mutateAsync } = useMutation({
        mutationKey: ['share-photo'],
        mutationFn: async (fileId: number) => PhotoService.sharePhoto(fileId),
        onError: async (error) => await ApiErrorHandler(error, 'Api error!'),
    });

    const sharePhotoHandler = async () => {
        if (isAdminData?.result) {
            togglePopup(true, PopupTypes.CreateUniqueRepost, item.data.id);
            return;
        }
        const { result } = await mutateAsync(item.data.id);
        if (shareMessage.isAvailable()) {
            await shareMessage(result);
        }
    };

    return (
        <div className="modal-dialog photo-gallery-modal">
            <div className="photo-gallery-modal__top">
                <div className="top-user">
                    <UserFrame
                        width={35}
                        height={35}
                        achievementCount={item.profileData.achievementCount}
                        src={item.profileData.avatar}
                    />
                    <p className="top-user__username">{item.profileData.username}</p>
                </div>

                <div className="top-controls">
                    {!isLoading && (
                        <m.div whileTap={{ scale: 0.9 }} onClick={sharePhotoHandler}>
                            <svg
                                width="40"
                                height="40"
                                viewBox="0 0 40 40"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <circle cx="20" cy="20" r="19.5" fill="#EBEBFF" stroke="#8000FF" />
                                <g clipPath="url(#clip0_2094_52143)">
                                    <path
                                        d="M23.933 12.9995C23.7232 12.7898 23.456 12.647 23.165 12.5891C22.8741 12.5313 22.5726 12.561 22.2985 12.6745C22.0245 12.788 21.7902 12.9802 21.6254 13.2268C21.4606 13.4734 21.3726 13.7634 21.3725 14.06V15.2495H17.75C15.9604 15.2515 14.2447 15.9633 12.9792 17.2287C11.7138 18.4941 11.002 20.2099 11 21.9995V27.2495C11 27.4484 11.079 27.6391 11.2197 27.7798C11.3603 27.9204 11.5511 27.9995 11.75 27.9995C11.9489 27.9995 12.1397 27.9204 12.2803 27.7798C12.421 27.6391 12.5 27.4484 12.5 27.2495C12.5012 26.0564 12.9757 24.9125 13.8193 24.0688C14.663 23.2251 15.8069 22.7507 17 22.7495H21.3725V23.939C21.3726 24.2356 21.4606 24.5255 21.6254 24.7722C21.7902 25.0188 22.0245 25.211 22.2985 25.3245C22.5726 25.438 22.8741 25.4677 23.165 25.4098C23.456 25.352 23.7232 25.2092 23.933 24.9995L28.3422 20.5902C28.7641 20.1683 29.001 19.5961 29.001 18.9995C29.001 18.4029 28.7641 17.8307 28.3422 17.4087L23.933 12.9995Z"
                                        fill="#8000FF"
                                    />
                                </g>
                                <defs>
                                    <clipPath id="clip0_2094_52143">
                                        <rect width="18" height="18" fill="white" transform="translate(11 11)" />
                                    </clipPath>
                                </defs>
                            </svg>
                        </m.div>
                    )}

                    <m.div whileTap={{ scale: 0.9 }} onClick={() => togglePopup(false)}>
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="20" cy="20" r="19.5" fill="#FFBFC3" stroke="#DA1E28" />
                            <path
                                d="M25.5 14.5C25.3281 14.3281 25.0949 14.2316 24.8519 14.2316C24.6088 14.2316 24.3757 14.3281 24.2038 14.5L20 18.7038L15.7961 14.5C15.6242 14.3281 15.3911 14.2316 15.148 14.2316C14.905 14.2316 14.6719 14.3281 14.5 14.5C14.3281 14.6719 14.2316 14.905 14.2316 15.148C14.2316 15.3911 14.3281 15.6242 14.5 15.7961L18.7038 20L14.5 24.2038C14.3281 24.3757 14.2316 24.6088 14.2316 24.8519C14.2316 25.0949 14.3281 25.3281 14.5 25.5C14.6719 25.6718 14.905 25.7683 15.148 25.7683C15.3911 25.7683 15.6242 25.6718 15.7961 25.5L20 21.2961L24.2038 25.5C24.3757 25.6718 24.6088 25.7683 24.8519 25.7683C25.0949 25.7683 25.3281 25.6718 25.5 25.5C25.6718 25.3281 25.7683 25.0949 25.7683 24.8519C25.7683 24.6088 25.6718 24.3757 25.5 24.2038L21.2961 20L25.5 15.7961C25.6718 15.6242 25.7683 15.3911 25.7683 15.148C25.7683 14.905 25.6718 14.6719 25.5 14.5Z"
                                fill="#DA1E28"
                            />
                        </svg>
                    </m.div>
                </div>
            </div>
            {!isEditMode && (
                <div className="photo-gallery-modal__line">
                    <div className="line-item">
                        <p>{t('Date')}:</p>
                        <small>{item.data.date}</small>
                    </div>
                </div>
            )}

            {!isEditMode && (
                <div className="photo-gallery-modal__image">
                    <Image src={item.data.photo} quality={90} width={400} height={400} alt="img" />
                </div>
            )}

            <AnimatePresence>
                {!isEditMode && <ViewForm item={item} changeMode={(flag) => setIsEditMode(flag)} />}
                {isEditMode && <EditForm item={item} changeMode={(flag) => setIsEditMode(flag)} />}
            </AnimatePresence>
        </div>
    );
}
