import { useTranslations } from 'next-intl';
import Image from 'next/image';

import Button from '@/components/UI/Button/Button';

import { useModal } from '@/context/useModalContext';

import './battleMotivation.scss';

export function BattleMotivation() {
    const t = useTranslations('Modals.BattleMotivation');

    const { togglePopup } = useModal();

    const KEY = Math.floor(Math.random() * (2 + 1));

    return (
        <div className="modal-dialog battle-motivation-modal">
            <div className="battle-motivation-modal__top">
                <p>{t('Title')}</p>
            </div>
            <div className="battle-motivation-modal__content">
                <h2>
                    {t.rich('MOTIVATION_TEXT.' + KEY.toString(), {
                        br: () => <br />,
                    })}
                </h2>

                <Image src={'/img/battle/motivation/motivation.svg'} width={215} height={205} alt="motivation" />

                <span />
            </div>
            <div className="battle-motivation-modal__btns">
                <Button variant="active" onClick={() => togglePopup(false)}>
                    {t('Ok')}
                </Button>
            </div>
        </div>
    );
}
