'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

import Button from '@/components/UI/Button/Button';

import { useModal } from '@/context/useModalContext';

import './notSupport.scss';

export function NotSupport() {
    const t = useTranslations('Modals.NotSupport');

    const { togglePopup } = useModal();

    return (
        <div className="modal-dialog not-support">
            <div className="not-support__top">
                <Image src={'/img/ok-error.svg'} width={33} height={33} alt="error" />
                <h3>{t('Title')}</h3>
                <h2>{t('Description')}</h2>
            </div>

            <div className="not-support__buttons">
                <Button variant="active" onClick={() => togglePopup(false)}>
                    {t('Ok')}
                </Button>
            </div>
        </div>
    );
}
