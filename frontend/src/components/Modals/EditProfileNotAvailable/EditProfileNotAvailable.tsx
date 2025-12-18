import { useTranslations } from 'next-intl';
import Image from 'next/image';

import Button from '@/components/UI/Button/Button';

import { useModal } from '@/context/useModalContext';

import { ROUTES } from '@/lib/constants/Routes';

import { useRouter } from '@/i18n/routing';

import './editProfileNotAvailable.scss';

export function EditProfileNotAvailable({
    backAction,
    changeProfileAction,
}: {
    backAction: () => void;
    changeProfileAction: (premium_only?: boolean) => Promise<void>;
}) {
    const t = useTranslations('Modals.EditProfileNotAvailable');

    const router = useRouter();
    const { togglePopup } = useModal();

    return (
        <div className="modal-dialog edit-profile-not-available">
            <div className="edit-profile-not-available__top">
                <Image src={'/img/ok-error.svg'} width={33} height={33} alt="error" />
                <h3>{t('Title')}</h3>
            </div>

            <div className="edit-profile-not-available__description">
                <p>
                    {t.rich('Description', {
                        b: (chunks) => <b>{chunks}</b>,
                    })}
                </p>
            </div>

            <div className="not-enough-money-modal__buttons">
                <Button
                    variant="active"
                    onClick={() => {
                        router.push(ROUTES.PREMIUM);
                        togglePopup(false);
                    }}
                >
                    {t('GetPrem')}
                </Button>
                <Button
                    variant="orange"
                    onClick={() => {
                        changeProfileAction(false);
                        backAction();
                    }}
                >
                    {t('Pay')}
                </Button>
                <Button variant="stroke" onClick={backAction}>
                    {t('Cancel')}
                </Button>
            </div>
        </div>
    );
}
