import { useTranslations } from 'next-intl';
import React from 'react';

import SelectLanguageIcon from '../../../public/img/select-language-icon.svg';

import './selectLanguageButton.scss';

interface ISelectLanguageButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const SelectLanguageButton: React.FC<ISelectLanguageButton> = (props) => {
    const t = useTranslations('WelcomePage');
    return (
        <button className="select-language-button" {...props}>
            <SelectLanguageIcon />
            {t('selectLanguageButton')}
        </button>
    );
};

export default SelectLanguageButton;
