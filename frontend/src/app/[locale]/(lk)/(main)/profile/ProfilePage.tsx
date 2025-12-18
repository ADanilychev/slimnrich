'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Suspense, useCallback, useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';

import { AchievementsBadge } from '@/components/Badges/AchievementsBadge/AchievementsBadge';
import ProfileBadges from '@/components/Badges/ProfileBadges/ProfileBadges';
import InviteFriends from '@/components/InviteFriends/InviteFriends';
import Button from '@/components/UI/Button/Button';

import { ROUTES } from '@/lib/constants/Routes';

import { ControlListSkeleton } from './Controls/ControlListSkeleton';
import { ProfileControls } from './Controls/ProfileControls';
import { getSettingsControls } from './ControlsList';
import { useProfile } from '@/hooks/react-queries/useProfile';
import { useRouter } from '@/i18n/routing';

import './profilePage.scss';

const ProfilePage = () => {
    const t = useTranslations('Pages.ProfilePage');

    const router = useRouter();
    const local = useLocale();

    const { data, isLoading: isProfileLoading } = useProfile();

    const getSettingsControlsCallback = useMemo(() => {
        return getSettingsControls(local);
    }, [local]);

    return (
        <div className="profile-page">
            {isProfileLoading ? (
                <Skeleton className="tab-top-wrapper profile-badge" height={120} width={'-webkit-fill-available'} />
            ) : (
                <ProfileBadges
                    profileData={{
                        username: data?.name,
                        achievementCount: data?.achievements_count,
                        avatar: data?.avatar,
                        userId: data?.user_id,
                        isPremium: data?.is_premium,
                    }}
                />
            )}

            <div className="main-content">
                <AchievementsBadge />

                {!isProfileLoading && !data?.is_premium && (
                    <div className="profile-page__premium">
                        <Button variant={'active'} onClick={() => router.push(ROUTES.PREMIUM)}>
                            {t('GetPrem')}
                        </Button>
                    </div>
                )}

                <InviteFriends />

                <Suspense fallback={<ControlListSkeleton />}>
                    <ProfileControls list={getSettingsControlsCallback} />
                </Suspense>
            </div>
        </div>
    );
};

export default ProfilePage;
