import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useModal } from '@/context/useModalContext';

import { ROUTES } from '@/lib/constants/Routes';
import { PopupTypes } from '@/lib/types/ModalContext.type';
import { IBasicUserData } from '@/lib/types/services/user.type';

import { usePathname, useRouter } from '@/i18n/routing';
import { UserService } from '@/services/user.service';

export const useProfile = () => {
    const router = useRouter();
    const pathname = usePathname();

    const { togglePopup } = useModal();
    const queryClient = useQueryClient();

    const profile = useQuery({
        queryKey: ['get-user-basic-data'],
        queryFn: async () => await UserService.getBasicUserData(),
        staleTime: 300000, // 5 минут
    });

    useEffect(() => {
        if (!profile.data) return;

        if (profile.data.is_banned && pathname !== ROUTES.BAN) {
            router.push(ROUTES.BAN);
        }

        if (!profile.data.is_banned && profile.data.new_achievements.length) {
            togglePopup(true, PopupTypes.NewAchievement, profile.data.new_achievements);
            queryClient.setQueryData(['get-user-basic-data'], (oldData: IBasicUserData) => {
                return {
                    ...oldData,
                    new_achievements: [],
                };
            });
        }
    }, [profile.data]);

    return { ...profile };
};
