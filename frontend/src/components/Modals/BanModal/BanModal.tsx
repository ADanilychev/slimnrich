'use client';

import { formatDistance } from 'date-fns';
import { enGB } from 'date-fns/locale';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useMemo } from 'react';

import Button from '@/components/UI/Button/Button';

import { useModal } from '@/context/useModalContext';

import { Link } from '@/i18n/routing';

import './banModal.scss';

export function BanModal({ ban_timestamp }: { ban_timestamp: number }) {
    const t = useTranslations('Modals.BanModal');

    const { togglePopup } = useModal();

    const formatTime = useMemo(() => {
        return formatDistance(ban_timestamp * 1000, Date.now(), {
            addSuffix: true,
            locale: enGB,
            includeSeconds: true,
        });
    }, [ban_timestamp]);

    return (
        <div className="modal-dialog ban-modal">
            <div className="ban-modal__top">
                <Image src={'/img/ok-error.svg'} width={33} height={33} alt="error" />
                <h3>{t('Title')}</h3>
                <h2>
                    {t.rich('Description', {
                        time: formatTime,
                        b: (chunks) => <b>{chunks}</b>,
                    })}
                </h2>
            </div>

            <div className="ban-modal__description">
                <p>
                    {t('Hint')}
                    <br />
                    <Link target="_blank" href="mailto:76bavmin@gmail.com">
                        <b>76bavmin@gmail.com</b>
                    </Link>
                </p>
            </div>

            <div className="ban-modal__buttons">
                <Button variant="active" onClick={() => togglePopup(false)}>
                    {t('Ok')}
                </Button>
            </div>
        </div>
    );
}
