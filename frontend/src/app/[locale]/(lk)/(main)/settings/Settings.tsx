'use client';

import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

import TabTopWrapper from '@/hoc/TabTopWrapper/TabTopWrapper';

import { SETTINGS_TYPE, SUPPORT_TAB } from '@/lib/constants/Routes';

import ControlHeader from '../profile/Controls/ControlHeader/ControlHeader';
import { getSettingsControls } from '../profile/ControlsList';

import GetMoneyBlock from './GetMoneyBlock';
import PrivacyBlock from './PrivacyBlock';
import RuleBlock from './RuleBlock';
import GetMoneySettings from './SettingType/GetMoneySettings';
import LanguageSettings from './SettingType/LanguageSettings';
import NotificationSettings from './SettingType/NotificationSettings';
import PrivacySettings from './SettingType/PrivacySettings';
import RulesSettings from './SettingType/RulesSettings';
import { SupportSettings } from './SettingType/SupportSettings/SupportSettings';
import { SupportWrapper } from './SettingType/SupportWrapper/SupportWrapper';
import TimeZoneSettings from './SettingType/TimeZoneSettings';
import UnitsSettings from './SettingType/UnitsSettings';

import './settings.scss';

const Settings = () => {
    const local = useLocale();

    const searchParams = useSearchParams();
    const [supportTab, setSupportTub] = useState<SUPPORT_TAB>(SUPPORT_TAB.HISTORY);
    const [settingControl, setSettingControl] = useState<{
        ico: string;
        text: string;
        slug: SETTINGS_TYPE;
    } | null>();
    const [isLoading, setIsLoading] = useState(true);

    const renderSettingType = () => {
        if (!settingControl) return null;

        switch (settingControl.slug) {
            case SETTINGS_TYPE.UNITS:
                return <UnitsSettings />;
            case SETTINGS_TYPE.LANGUAGE:
                return <LanguageSettings />;
            case SETTINGS_TYPE.TIME_ZONE:
                return <TimeZoneSettings />;
            case SETTINGS_TYPE.NOTIFICATIONS:
                return <NotificationSettings />;
            case SETTINGS_TYPE.RULES:
                return <RulesSettings />;
            case SETTINGS_TYPE.PRIVACY:
                return <PrivacySettings />;
            case SETTINGS_TYPE.GET_MONEY:
                return <GetMoneySettings />;
            case SETTINGS_TYPE.SUPPORT:
                return <SupportSettings changeTabHandler={setSupportTub} currentTab={supportTab} />;
        }
    };

    useEffect(() => {
        async function fetchSettings() {
            setIsLoading(true);
            try {
                const list = await getSettingsControls(local);
                const type = searchParams.get('type');
                const control = type ? list.findLast((x) => x.slug === type) : list[0];

                setSettingControl(control);
            } catch {}
            setIsLoading(false);
        }

        fetchSettings();
    }, [searchParams, local]);

    if (isLoading) return <Skeleton className="settings-page" height={300} />;

    return (
        <div className="settings-page">
            <TabTopWrapper>
                <ControlHeader text={settingControl?.text || ''} ico={settingControl?.ico || ''} />
                {renderSettingType()}
            </TabTopWrapper>
            {SETTINGS_TYPE.RULES === settingControl?.slug && <RuleBlock />}
            {SETTINGS_TYPE.PRIVACY === settingControl?.slug && <PrivacyBlock />}
            {SETTINGS_TYPE.GET_MONEY === settingControl?.slug && <GetMoneyBlock />}
            {SETTINGS_TYPE.SUPPORT === settingControl?.slug && <SupportWrapper supportTab={supportTab} />}
        </div>
    );
};

export default Settings;
