import type { Metadata, Viewport } from 'next';
import { getMessages, getTimeZone } from 'next-intl/server';
import Script from 'next/script';
import 'react-loading-skeleton/dist/skeleton.css';

import YMetrics from '@/components/YandexMetrika/YandexMetrika';

import ContextProvider from '@/hoc/ContextProvider';

import { NextIntlProvider } from '@/Providers/NextIntlClientProvider';

import { ManropeFonts } from '../fonts/font';

import '../../scss/global.scss';

export const metadata: Metadata = {
    title: 'App weight',
    description: 'Telegram App weight',
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

const isProdMode = !!(process.env.NODE_ENV === 'production');

export default async function RootLayout(
    props: Readonly<{
        children: React.ReactNode;
        params: { locale: string };
    }>,
) {
    const params = await props.params;

    const { locale } = params;

    const { children } = props;

    const messages = await getMessages();
    const timeZone = await getTimeZone();

    return (
        <html lang={locale} suppressHydrationWarning>
            <body className={`${ManropeFonts.className} hidden-scroll`}>
                <NextIntlProvider locale={locale} messages={messages} timeZone={timeZone}>
                    <ContextProvider>
                        {/* {!isProdMode && (
                            <Script
                                src="https://unpkg.com/react-scan/dist/auto.global.js"
                                strategy="beforeInteractive"
                            />
                        )} */}

                        <Script src="https://telegram.org/js/telegram-web-app.js?56" strategy="beforeInteractive" />
                        {children}
                        <YMetrics enabled={isProdMode} />
                    </ContextProvider>
                </NextIntlProvider>
            </body>
        </html>
    );
}
