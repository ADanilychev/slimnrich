import { useMutation } from '@tanstack/react-query';

import { IUserSettingsPayload } from '@/lib/types/services/user-settings.type';

import { UserService } from '@/services/user.service';

export const useChangeSettings = () => {
    const query = useMutation({
        mutationKey: ['change-settings'],
        mutationFn: async (payload: IUserSettingsPayload) => await UserService.changeSettings(payload),
    });

    return { ...query };
};
