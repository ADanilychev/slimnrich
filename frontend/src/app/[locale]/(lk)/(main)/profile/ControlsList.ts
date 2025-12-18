import { SETTINGS_TYPE } from '@/lib/constants/Routes';

export const getSettingsControls = async (
    locale: string = 'en',
): Promise<
    {
        ico: string;
        text: string;
        slug: SETTINGS_TYPE;
    }[]
> => {
    const messages = (await import(`../../../../../locales/${locale}.json`)).default;

    return [
        {
            ico: '/img/profileControls/support.svg',
            text: messages['Settings']['Support'].title,
            slug: SETTINGS_TYPE.SUPPORT,
        },
        {
            ico: '/img/profileControls/units.svg',
            text: messages['Settings']['Units'].title,
            slug: SETTINGS_TYPE.UNITS,
        },
        {
            ico: '/img/profileControls/lang.svg',
            text: messages['Settings']['ChangeLanguage'].title,
            slug: SETTINGS_TYPE.LANGUAGE,
        },
        {
            ico: '/img/profileControls/time.svg',
            text: messages['Settings']['TimeZone'].title,
            slug: SETTINGS_TYPE.TIME_ZONE,
        },
        {
            ico: '/img/profileControls/notify.svg',
            text: messages['Settings']['Notifications'].title,
            slug: SETTINGS_TYPE.NOTIFICATIONS,
        },
        {
            ico: '/img/profileControls/rules.svg',
            text: messages['Settings']['Rules'].title,
            slug: SETTINGS_TYPE.RULES,
        },
        {
            ico: '/img/profileControls/rules.svg',
            text: messages['Settings']['Privacy'].title,
            slug: SETTINGS_TYPE.PRIVACY,
        },
        {
            ico: '/img/profileControls/rules.svg',
            text: messages['Settings']['GetMoney'].title,
            slug: SETTINGS_TYPE.GET_MONEY,
        },
        {
            ico: '/img/profileControls/deleteAccount.svg',
            text: messages['Settings']['DeleteAccount'].title,
            slug: SETTINGS_TYPE.DELETE_ACCOUNT,
        },
    ];
};
