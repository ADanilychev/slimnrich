'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import React from 'react';

import RadioButton from '@/components/UI/RadioButton/RadioButton';

import { useModal } from '@/context/useModalContext';

import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';

import { useChangeSettings } from '@/hooks/react-queries/useChangeSettings';
import { usePathname, useRouter } from '@/i18n/routing';
import { useAppStore } from '@/store/app.store';

import './selectLanguageModal.scss';

const SelectLanguageModal = () => {
    const t = useTranslations('Modals.SelectLanguageModal');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const language = useAppStore((store) => store.language);
    const setLanguage = useAppStore((store) => store.setLanguage);

    const { mutateAsync } = useChangeSettings();

    const { togglePopup } = useModal();

    const changeLanguage = async (value: 'en' | 'es' | 'ru') => {
        await mutateAsync(
            {
                language: value,
            },
            {
                onSuccess: () => {
                    togglePopup(false);
                    setLanguage(value);
                    router.push(`${pathname}?${searchParams.toString()}`, { locale: value });
                },
                onError: async (error) => {
                    await ApiErrorHandler(error, "Couldn't change the language");
                },
            },
        );
    };

    return (
        <div className="modal-dialog select-language-modal">
            <h2 className="select-language-modal__title">{t('Title')}</h2>

            <div className="select-language-modal__content">
                <RadioButton
                    value={'ru'}
                    id={'ln-ru'}
                    name={'select-lang'}
                    checked={language === 'ru'}
                    text={'Русский'}
                    onClick={changeLanguage}
                />
                <RadioButton
                    value={'en'}
                    id={'ln-en'}
                    name={'select-lang'}
                    text={'English'}
                    checked={language === 'en'}
                    onClick={changeLanguage}
                />
                <RadioButton
                    value={'es'}
                    id={'ln-es'}
                    name={'select-lang'}
                    text={'Español'}
                    checked={language === 'es'}
                    onClick={changeLanguage}
                />
                <RadioButton
                    value={'soon'}
                    id={'soon'}
                    name={'select-lang'}
                    text={'Coming soon'}
                    disabled
                    onClick={changeLanguage}
                />
            </div>
        </div>
    );
};

export default SelectLanguageModal;
