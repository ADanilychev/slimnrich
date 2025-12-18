'use client';

import { initData, useSignal } from '@telegram-apps/sdk-react';
import { getCookie, setCookie } from 'cookies-next';
import { useEffect } from 'react';

import MainLoader from '@/components/MainLoader/MainLoader';

import { ROUTES } from '@/lib/constants/Routes';
import { ADMIN_PAGE } from '@/lib/constants/admin.routes';

import { useCheckRole } from '@/hooks/react-queries/useCheckRole';
import { useRouter } from '@/i18n/routing';

const Page = () => {
    const router = useRouter();
    const initDataSignal = useSignal(initData.raw);

    const { data, isLoading, isError, refetch } = useCheckRole(false);

    useEffect(() => {
        const userSession = getCookie('user-session');
        if (initDataSignal && !userSession) {
            setCookie('user-session', initDataSignal);
            refetch();
        }
    }, [initDataSignal]);

    useEffect(() => {
        if (isLoading) return;

        if (isError || data === null || data?.result === null) {
            router.push(ROUTES.BATTLE);
        } else {
            const href = data?.result ? ADMIN_PAGE.CHAT : ADMIN_PAGE.USERS;
            router.push(href);
        }
    }, [data, isLoading, isError]);

    return <MainLoader />;
};

export default Page;
