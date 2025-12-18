import { initData, useSignal } from '@telegram-apps/sdk-react';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';

import RadioButton from '@/components/UI/RadioButton/RadioButton';

import { ROUTES, SUPPORT_TAB } from '@/lib/constants/Routes';

import { useRouter } from '@/i18n/routing';

import './supportSettings.scss';

export function SupportSettings({
    changeTabHandler,
    currentTab,
}: {
    changeTabHandler: (tab: SUPPORT_TAB) => void;
    currentTab: SUPPORT_TAB;
}) {
    const t = useTranslations('Pages.SupportPage');
    const router = useRouter();
    const userSignal = useSignal(initData.user);

    const [_, startTransition] = useTransition();

    return (
        <div className="support-settings">
            <p className="support-settings__text">{t('Subtitle')}</p>
            <div className="support-settings__tabs">
                <RadioButton
                    value={SUPPORT_TAB.HISTORY}
                    id={SUPPORT_TAB.HISTORY}
                    name={'type'}
                    text={t('SupportTabs.History')}
                    checked={currentTab === SUPPORT_TAB.HISTORY}
                    onClick={() => changeTabHandler(SUPPORT_TAB.HISTORY)}
                />
                <RadioButton
                    value={SUPPORT_TAB.FAQ}
                    id={SUPPORT_TAB.FAQ}
                    name={'type'}
                    text={t('SupportTabs.FAQ')}
                    checked={currentTab === SUPPORT_TAB.FAQ}
                    onClick={() => changeTabHandler(SUPPORT_TAB.FAQ)}
                />
                <RadioButton
                    value={SUPPORT_TAB.CHAT}
                    id={SUPPORT_TAB.CHAT}
                    name={'type'}
                    text={t('SupportTabs.Chat')}
                    checked={currentTab === SUPPORT_TAB.CHAT}
                    onClick={() => {
                        startTransition(() => {
                            changeTabHandler(SUPPORT_TAB.CHAT);
                            router.push(ROUTES.SUPPORT_CHAT(userSignal?.id || 0));
                        });
                    }}
                />
            </div>
        </div>
    );
}
