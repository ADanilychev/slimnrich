import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';
import { IBasicUserData } from '@/lib/types/services/user.type';

import { GiftService } from '@/services/gift.service';

export const useSendGift = () => {
    const t = useTranslations();

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationKey: ['send-user-gift'],
        mutationFn: async (fileId: number) => GiftService.sendGift(fileId),
        onSuccess: async () => {
            const { toast } = await import('react-hot-toast');
            toast.success(t('SendGiftSuccess'), { id: 'gift-success' });

            queryClient.setQueryData(['get-user-basic-data'], (oldData: IBasicUserData) => {
                return {
                    ...oldData,
                    bonus_balance: oldData.bonus_balance - 10,
                };
            });
        },
        onError: async (error) => await ApiErrorHandler(error, 'Api Error!'),
    });

    return { ...mutation };
};
