'use client';

import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useCheckSupport } from '@/hooks/useCheckSupport';
import { usePathname, useRouter } from '@/i18n/routing';
import { UserService } from '@/services/user.service';
import { useAppStore } from '@/store/app.store';

export function UserLocalizationProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const language = useAppStore((store) => store.language);
    const setLanguage = useAppStore((store) => store.setLanguage);

    const checkSupport = useCheckSupport();

    useEffect(() => {
        (async function fetchUserLocation() {
            if (!language.length) {
                const { result } = await UserService.getUserLanguage();
                setLanguage(result);
            }

            checkSupport(() => router.push(`${pathname}?${searchParams.toString()}`, { locale: language }));
        })();
    }, [pathname, language]);

    return children;
}
