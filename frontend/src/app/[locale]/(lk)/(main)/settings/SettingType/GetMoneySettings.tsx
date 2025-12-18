import { useTranslations } from 'next-intl';

const GetMoneySettings = () => {
    const t = useTranslations('Pages.GetMoneyPage');

    return (
        <div className="rules-setting">
            <p className="rules-setting__text">{t('Subtitle')}</p>
        </div>
    );
};

export default GetMoneySettings;
