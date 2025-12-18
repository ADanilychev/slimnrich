'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { UserFrame } from '@/components/UserFrame/UserFrame';

import { useModal } from '@/context/useModalContext';

import TabTopWrapper from '@/hoc/TabTopWrapper/TabTopWrapper';

import { ROUTES } from '@/lib/constants/Routes';
import { PopupDirection, PopupTypes } from '@/lib/types/ModalContext.type';
import { IProfileDataProps } from '@/lib/types/services/user.type';

import { useRouter } from '@/i18n/routing';

import './profileBadges.scss';

interface Props {
    otherUser?: boolean;
    isAdmin?: boolean;
    profileData: IProfileDataProps;
    showReport?: boolean;
}
const ProfileBadges = ({ otherUser = false, isAdmin = false, profileData, showReport = true }: Props) => {
    const router = useRouter();
    const { togglePopup } = useModal();
    const t = useTranslations('Badges.ProfileBadges');

    const editProfileHandler = () => {
        togglePopup(true, PopupTypes.EditProfile, '', PopupDirection.TopToBottom);
    };

    const openReport = () => {
        togglePopup(true, PopupTypes.SendUserReport, profileData.userId);
    };

    return (
        <TabTopWrapper className="profile-badge">
            <div className="profile-badge__left-side">
                {profileData.isPremium && (
                    <Image
                        width={20}
                        height={20}
                        src={'/img/currency/premium.svg'}
                        className="premium-icon"
                        alt="premium-icon"
                    />
                )}
                <UserFrame
                    width={75}
                    height={75}
                    achievementCount={profileData.achievementCount}
                    src={profileData.avatar}
                />
            </div>

            <div className="profile-badge__right-side">
                <p className="profile-badge__username">{profileData.username}</p>
                {!isAdmin && !otherUser && (
                    <div className="profile-badge__wrapper">
                        <p className="profile-badge__edit" onClick={editProfileHandler}>
                            {t('EditProfile')}
                        </p>
                        <p
                            className="profile-badge__profile-link"
                            onClick={() => router.push(ROUTES.USER(profileData.userId || 0))}
                        >
                            {t('OpenProfile')}
                        </p>
                    </div>
                )}

                {!isAdmin && otherUser && (
                    <div className="profile-badge__wrapper">
                        {showReport && (
                            <p className="profile-badge__report" onClick={openReport}>
                                {t('SendReport')}
                            </p>
                        )}

                        <p className="profile-badge__edit" onClick={() => router.back()}>
                            {t('GoBack')}
                        </p>
                    </div>
                )}

                {isAdmin && (
                    <div className="profile-badge__wrapper">
                        {!profileData.isBan && (
                            <p
                                className="profile-badge__report"
                                onClick={() =>
                                    togglePopup(true, PopupTypes.SetUserBan, {
                                        violator_id: profileData.userId,
                                        useModeration: false,
                                    })
                                }
                            >
                                {t('UserBlock')}
                            </p>
                        )}

                        <p className="profile-badge__edit" onClick={() => router.back()}>
                            {t('GoBack')}
                        </p>
                    </div>
                )}
            </div>
        </TabTopWrapper>
    );
};

export default ProfileBadges;
