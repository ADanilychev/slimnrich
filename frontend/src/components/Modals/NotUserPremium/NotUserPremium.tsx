import { useTranslations } from 'next-intl';
import Image from 'next/image';

import Button from '@/components/UI/Button/Button';

import { useModal } from '@/context/useModalContext';

import { ROUTES } from '@/lib/constants/Routes';

import { useRouter } from '@/i18n/routing';

import './notUserPremium.scss';

export function NotUserPremium() {
    const t = useTranslations('Modals.NotUserPremium');

    const router = useRouter();
    const { togglePopup } = useModal();

    const getPremiumLink = () => {
        togglePopup(false);
        router.push(ROUTES.PREMIUM);
    };

    return (
        <div className="modal-dialog not-user-premium-modal">
            <div className="not-user-premium-modal__top">
                <Image src={'/img/ok-error.svg'} width={33} height={33} alt="error" />
                <h3>{t('Title')}</h3>
            </div>

            <div className="not-user-premium-modal__description">
                <p>
                    {t.rich('Description', {
                        b: (chunks) => <b>{chunks}</b>,
                    })}
                </p>
            </div>

            <div className="not-user-premium-modal__buttons">
                <Button variant="active" onClick={getPremiumLink}>
                    {t('Get')}
                </Button>
                <Button variant="stroke" onClick={() => togglePopup(false)}>
                    {t('Cancel')}
                </Button>
            </div>
        </div>
    );
}
