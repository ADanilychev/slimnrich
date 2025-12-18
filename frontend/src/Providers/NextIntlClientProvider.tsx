'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { LazyMotion, domAnimation } from 'framer-motion';
import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl';
import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

import { queryClient } from '@/lib/configs/QueryClient.config';
import { init } from '@/lib/core/init';

import { UserLocalizationProvider } from './UserLocalizationProvider';

export const NextIntlProvider = ({
    children,
    locale,
    messages,
    timeZone,
}: Readonly<{
    children: React.ReactNode;
    locale: string;
    messages: AbstractIntlMessages | undefined;
    timeZone: any;
}>) => {
    useEffect(() => {
        try {
            init();
        } catch {}
    }, []);

    return (
        <>
            <Toaster
                position="top-center"
                reverseOrder={false}
                gutter={2}
                containerClassName=""
                containerStyle={{}}
                toastOptions={{
                    // Define default options
                    className: '',
                    duration: 4000,
                    removeDelay: 1000,
                    style: {
                        background: '#DDDDFF',
                        color: '#7300E5',
                    },

                    // Default options for specific types
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: '#00b600',
                            secondary: '#DDDDFF',
                        },
                    },
                }}
            />
            <QueryClientProvider client={queryClient}>
                <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
                    <UserLocalizationProvider>
                        <LazyMotion features={domAnimation}>{children}</LazyMotion>
                    </UserLocalizationProvider>
                </NextIntlClientProvider>
            </QueryClientProvider>
        </>
    );
};
