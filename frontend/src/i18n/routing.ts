import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    locales: ['en', 'es', 'ru'],
    defaultLocale: 'ru',
    localePrefix: {
        mode: 'always',
    },
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
