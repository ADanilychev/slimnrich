import { initData, retrieveLaunchParams } from '@telegram-apps/sdk-react';

export const useTelegramData = () => {
    const { tgWebAppData } = retrieveLaunchParams();

    return { ...tgWebAppData, initData };
};
