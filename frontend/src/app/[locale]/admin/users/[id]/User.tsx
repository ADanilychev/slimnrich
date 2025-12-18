'use client';

import { useQuery } from '@tanstack/react-query';

import { AnswerUserTestBadge } from '@/components/ADMIN/Badges/AnswerUserTestBadge/AnswerUserTestBadge';
import { BattlesBadge } from '@/components/ADMIN/Badges/BattlesBadge/BattlesBadge';
import { ProfileStatisticsBadge } from '@/components/ADMIN/Badges/ProfileStatisticsBadge/ProfileStatisticsBadge';
import { ReportsOnUser } from '@/components/ADMIN/Badges/ReportsOnUser/ReportsOnUser';
import { Accordion } from '@/components/Accordion/Accordion';
import { AccordionItem } from '@/components/Accordion/AccordionItem';
import BalanceHistoryBadge from '@/components/Badges/BalanceHistoryBadge/BalanceHistoryBadge';
import { PhotoShowcase } from '@/components/Badges/PhotoShowcase/PhotoShowcase';
import ProfileBadges from '@/components/Badges/ProfileBadges/ProfileBadges';
import MainLoader from '@/components/MainLoader/MainLoader';
import Button from '@/components/UI/Button/Button';

import { useModal } from '@/context/useModalContext';

import { ADMIN_PAGE } from '@/lib/constants/admin.routes';
import { PopupTypes } from '@/lib/types/ModalContext.type';
import { IProfileDataProps } from '@/lib/types/services/user.type';

import { useRouter } from '@/i18n/routing';
import { AdminService } from '@/services/admin.service';

import './user.scss';

export function User({ userId }: { userId: string }) {
    const router = useRouter();
    const { togglePopup } = useModal();

    const {
        data: otherProfile,
        isLoading: isLoadingOtherProfile,
        isFetching,
    } = useQuery({
        queryKey: ['fetch-moderation-other-profile'],
        queryFn: async () => await AdminService.getUser(userId),
    });

    const profileData: IProfileDataProps = {
        username: otherProfile?.name,
        userId: otherProfile?.user_id,
        achievementCount: otherProfile?.achievements_count,
        avatar: otherProfile?.avatar,
        isPremium: otherProfile?.is_premium,
    };

    if (isLoadingOtherProfile) return <MainLoader />;

    return (
        <div className="admin-user-page">
            <ProfileBadges
                isAdmin={true}
                profileData={{
                    username: otherProfile?.name,
                    userId: otherProfile?.user_id,
                    achievementCount: otherProfile?.achievements_count,
                    avatar: otherProfile?.avatar,
                    isPremium: otherProfile?.is_premium,
                    isBan: otherProfile?.is_banned,
                }}
            />
            {otherProfile?.is_banned && (
                <p className="admin-user-page__ban-hint">
                    This user is blocked until <b>{otherProfile.ban_until}</b>
                </p>
            )}
            {!isFetching && (
                <Button
                    className="admin-user-page__chat-btn"
                    variant={'stroke'}
                    onClick={() => router.push(ADMIN_PAGE.USER_CHAT(otherProfile?.user_id || 0))}
                >
                    Start chat with support service
                </Button>
            )}
            <div className="admin-page__content">
                <Accordion>
                    <AccordionItem title="Photo gallery">
                        <PhotoShowcase
                            showcase={otherProfile?.results || null}
                            user_id={otherProfile?.user_id || 0}
                            profileData={profileData}
                            isMyProfile={false}
                        />
                    </AccordionItem>
                    <AccordionItem title="Reports on this users">
                        <ReportsOnUser user={otherProfile} />
                    </AccordionItem>
                    <AccordionItem title="Profile statistics">
                        <ProfileStatisticsBadge user={otherProfile} />
                    </AccordionItem>
                    <AccordionItem title="User battles">
                        <BattlesBadge battles={otherProfile?.battles_info || []} isLoading={isLoadingOtherProfile} />
                    </AccordionItem>
                    <AccordionItem title="Balance history">
                        {!isLoadingOtherProfile &&
                            otherProfile &&
                            Object.entries(otherProfile?.balance_history.result).map(([date, items]) => (
                                <BalanceHistoryBadge
                                    key={date}
                                    title={date}
                                    history={items}
                                    showBalanceHistoryLink={false}
                                />
                            ))}
                    </AccordionItem>
                    <AccordionItem title="Answers to the test">
                        <AnswerUserTestBadge test={otherProfile?.about_data || {}} />
                    </AccordionItem>
                </Accordion>
            </div>

            <div className="admin-user-page__btn">
                {!otherProfile?.is_banned ? (
                    <Button
                        variant={'active'}
                        onClick={() =>
                            togglePopup(true, PopupTypes.SetUserBan, {
                                violator_id: otherProfile?.user_id,
                                useModeration: false,
                            })
                        }
                    >
                        User block
                    </Button>
                ) : (
                    <Button
                        variant={'stroke'}
                        onClick={() => togglePopup(true, PopupTypes.UnBanUser, otherProfile?.user_id)}
                    >
                        Unban a user
                    </Button>
                )}
            </div>
        </div>
    );
}
