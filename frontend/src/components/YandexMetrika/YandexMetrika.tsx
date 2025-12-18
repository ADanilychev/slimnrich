'use client';

import { FC, useEffect } from 'react';
import ym, { YMInitializer } from 'react-yandex-metrika';

import { usePathname } from '@/i18n/routing';

interface IYMetrics {
    enabled: boolean;
}

const YMetrics: FC<IYMetrics> = ({ enabled }) => {
    const pathname = usePathname();

    useEffect(() => {
        if (enabled) {
            ym('hit', window.location.href);
        } else {
            console.log(`%c[YandexMetrika](HIT)`, `color: orange`, window.location.href);
        }
    }, [pathname, enabled]);

    if (!enabled) return null;

    return (
        <YMInitializer
            accounts={[100618937]}
            options={{
                defer: true,
                webvisor: true,
                clickmap: true,
                trackLinks: true,
                accurateTrackBounce: true,
            }}
            version="2"
        />
    );
};

export default YMetrics;
