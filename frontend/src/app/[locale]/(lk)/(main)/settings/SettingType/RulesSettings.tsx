import { useTranslations } from 'next-intl';

const RulesSettings = () => {
    const t = useTranslations('Settings.Rules');
    return (
        <div className="rules-setting">
            <p className="rules-setting__text">{t('subTitle')}</p>
        </div>
    );
};

export default RulesSettings;
