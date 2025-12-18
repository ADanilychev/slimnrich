import { addToHomeScreen, checkHomeScreenStatus, initData, init as initSDK, miniApp } from '@telegram-apps/sdk-react';

/**
 * Initializes the application and configures its dependencies.
 */
export function init(): void {
    initSDK();

    if (miniApp.mount.isAvailable()) {
        miniApp.mount();
    }

    initData.restore();

    checkHomeScreenStatus().then((isHomeScreen) => {
        if (isHomeScreen === 'missed') {
            addToHomeScreen();
        }
    });
}
