'use client';

import { useQuery } from '@tanstack/react-query';

import { PhotoShowcase } from '@/components/Badges/PhotoShowcase/PhotoShowcase';
import ProfileBadges from '@/components/Badges/ProfileBadges/ProfileBadges';
import { UserProfileStatisticBadge } from '@/components/Badges/UserProfileStatisticBadge/UserProfileStatisticBadge';
import MainLoader from '@/components/MainLoader/MainLoader';

import { IProfileDataProps } from '@/lib/types/services/user.type';

import { useProfile } from '@/hooks/react-queries/useProfile';
import { UserService } from '@/services/user.service';

import './userPage.scss';

export function UserPage({ userId }: { userId: string }) {
    const { data: me, isFetching: isMeFetching } = useProfile();

    const { data: otherProfile, isFetching: isFetchingOtherProfile } = useQuery({
        queryKey: ['fetch-other-profile'],
        queryFn: async () => await UserService.getOtherProfile(userId),
    });

    const profileData: IProfileDataProps = {
        username: otherProfile?.name,
        userId: otherProfile?.user_id,
        achievementCount: otherProfile?.achievements_count,
        avatar: otherProfile?.avatar,
        isPremium: otherProfile?.is_premium,
    };

    if (isFetchingOtherProfile && isMeFetching) return <MainLoader />;

    return (
        <div className="user-page">
            <ProfileBadges
                otherUser={true}
                showReport={me?.user_id !== otherProfile?.user_id}
                profileData={profileData}
            />

            <div className="main-content">
                <PhotoShowcase
                    showcase={otherProfile?.results || null}
                    user_id={otherProfile?.user_id || 0}
                    profileData={profileData}
                    isMyProfile={me?.user_id === otherProfile?.user_id}
                />

                <UserProfileStatisticBadge
                    weight_lost={otherProfile?.weight_lost || 0}
                    current_weight={otherProfile?.weight_kg || 0}
                    reg_date={otherProfile?.reg_date || 'Unknown'}
                />
            </div>
        </div>
    );
}
