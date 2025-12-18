'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

import Button from '@/components/UI/Button/Button';

import { useModal } from '@/context/useModalContext';

import './notEnoughMoney.scss';

export function NotEnoughMoney() {
    const t = useTranslations('Modals.NotEnoughMoney');

    const { togglePopup } = useModal();
    return (
        <div className="modal-dialog not-enough-money-modal">
            <div className="not-enough-money-modal__top">
                <Image src={'/img/ok-error.svg'} width={33} height={33} alt="error" />
                <h3>{t('Title')}</h3>
            </div>

            <div className="not-enough-money-modal__description">
                <p>
                    {t.rich('Description', {
                        b: (chunks) => <b>{chunks}</b>,
                    })}
                </p>

                {/* <div className="not-enough-money-modal__miss">
                    <p>You are missing:</p>
                    <p> 5 slims</p>
                </div> */}
            </div>

            <div className="not-enough-money-modal__buttons">
                <Button variant="active">{t('TopUp')}</Button>
                <Button variant="stroke" onClick={() => togglePopup(false)}>
                    {t('Cancel')}
                </Button>
            </div>
        </div>
    );
}
