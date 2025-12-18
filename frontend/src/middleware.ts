import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

import { routing } from './i18n/routing';
import { ROUTES } from './lib/constants/Routes';
import { ADMIN_PAGE } from './lib/constants/admin.routes';
import { detectUserLanguage } from './server-action/detect-user-language.action';
import { UserService } from './services/user.service';

const handleI18nRouting = createMiddleware(routing);

export async function middleware(request: NextRequest) {
    const { cookies } = request;
    const userSession = cookies.get('user-session');
    const currentLocal = await detectUserLanguage(request);

    const local = `/${currentLocal}`;

    if (!userSession?.value && request.nextUrl.pathname !== local && !request.nextUrl.pathname.includes('/admin')) {
        return NextResponse.redirect(new URL(local, request.url));
    }

    if (
        !userSession?.value &&
        request.nextUrl.pathname !== local + ADMIN_PAGE.INIT &&
        request.nextUrl.pathname.includes('/admin')
    ) {
        return NextResponse.redirect(new URL(local + ADMIN_PAGE.INIT, request.url));
    }

    if (userSession?.value) {
        const { result } = await UserService.currentAction_server(userSession.value);
        console.log('Current-action = ', result);

        if (
            result !== 2 &&
            !request.nextUrl.pathname.includes('/unauthorized') &&
            !request.nextUrl.pathname.includes(ROUTES.NOT_SUPPORT)
        ) {
            if (result === 1) {
                return NextResponse.redirect(new URL(local + ROUTES.STEP_BY_STEP_TEST, request.url));
            } else if (result === 0) {
                return NextResponse.redirect(new URL(local + ROUTES.WELCOME_PAGE(true), request.url));
            }
        }

        if (
            (result === 2 &&
                request.nextUrl.pathname.includes('/unauthorized') &&
                !request.nextUrl.pathname.includes('/admin')) ||
            request.nextUrl.pathname === local
        ) {
            return NextResponse.redirect(new URL(local + ROUTES.BATTLE, request.url));
        }
    }

    return handleI18nRouting(request);
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|img|favicon.ico|sitemap.xml|robots.txt).*)'],
};
