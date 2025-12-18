'use client';

import { ROUTES } from '@/lib/constants/Routes';
import { getPlatform } from '@/lib/helpers/getPlatform';

import { usePathname, useRouter } from '@/i18n/routing';

export const useCheckSupport = () => {
    const platform = getPlatform();

    const router = useRouter();
    const pathname = usePathname();

    const checkSupport = async (successCallback: (params?: unknown) => void) => {
        // if (platform === 'Web' && !pathname.includes('/admin') && !pathname.includes(ROUTES.NOT_SUPPORT)) {
        //     console.log('доступ запрещен');
        //     router.push(ROUTES.NOT_SUPPORT);
        // } else {
        successCallback();
        // }
    };

    return checkSupport;
};
