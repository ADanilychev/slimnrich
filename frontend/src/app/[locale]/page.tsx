'use client';

import { initData, useSignal } from '@telegram-apps/sdk-react';
import { getCookie, setCookie } from 'cookies-next';
import { useEffect } from 'react';

import MainLoader from '@/components/MainLoader/MainLoader';

import { useRouter } from '@/i18n/routing';

export default function Home() {
    const router = useRouter();
    const initDataSignal = useSignal(initData.raw);

    useEffect(() => {
        const userSession = getCookie('user-session');

        if (initDataSignal && !userSession) {
            setCookie('user-session', initDataSignal);
            router.refresh();
        }
    }, [initDataSignal]);

    return <MainLoader />;
}
