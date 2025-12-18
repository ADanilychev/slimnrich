import { AnimatePresence, m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';

import Button from '@/components/UI/Button/Button';
import { SelectInput } from '@/components/UI/Input/SelectInput/SelectInput';

import { useModal } from '@/context/useModalContext';

import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';
import { CHARITY_LIST } from '@/lib/types/services/user-settings.type';

import { useChangeSettings } from '@/hooks/react-queries/useChangeSettings';

import './battleCharity.scss';

const LIST = {
    'Cat Relief Fund': CHARITY_LIST.CATS,
    'Dog Relief Fund': CHARITY_LIST.DOGS,
    "Children's Aid Fund": CHARITY_LIST.CHILDREN,
    'Donation to the developers': CHARITY_LIST.DEVELOPERS,
};

export function BattleCharity() {
    const t = useTranslations('Modals.BattleCharity');

    const { togglePopup } = useModal();
    const [selectedCharity, setSelectedCharity] = useState('Cat Relief Fund');

    const [step, setStep] = useState(1);

    const { mutateAsync, isPending } = useChangeSettings();

    const KEY = Math.floor(Math.random() * (2 + 1));

    const sendCharity = async () => {
        await mutateAsync(
            { charity: LIST[selectedCharity as keyof typeof LIST] },
            {
                onSuccess: () => {
                    setStep((prev) => prev + 1);
                },
                onError: async (error) => await ApiErrorHandler(error, "Couldn't set the type of charity"),
            },
        );
    };

    return (
        <div className="modal-dialog battle-charity-modal">
            <AnimatePresence>
                {step === 1 && (
                    <m.div
                        className="battle-charity-modal__wrapper"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
                        <div className="battle-charity-modal__top">
                            <p>{t('Title')}</p>
                        </div>

                        <div className="battle-charity-modal__content">
                            <h2>
                                {t.rich('MOTIVATION_TEXT.' + KEY.toString(), {
                                    br: () => <br />,
                                })}
                            </h2>

                            <Image src={'/img/battle/charity/charity.svg'} width={215} height={190} alt="motivation" />

                            <span />
                        </div>

                        <SelectInput
                            title={t('SelectInputTitle')}
                            data={Object.keys(LIST)}
                            selectedElement={selectedCharity}
                            onSelectHandler={(item) => setSelectedCharity(item)}
                            render={(item) => (
                                <p style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>{t('LIST.' + item)}</p>
                            )}
                            displayFn={(item) => `${item}`}
                        />

                        <div className="battle-charity-modal__btns">
                            <Button variant="active" onClick={sendCharity} isLoading={isPending}>
                                {t('Confirm')}
                            </Button>
                        </div>
                    </m.div>
                )}

                {step === 2 && (
                    <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                        <div className="battle-charity-modal__top">
                            <p>{t('SuccessTitle')}</p>
                        </div>
                        <div className="battle-charity-modal__content">
                            <h2>{t('SuccessDescription')}</h2>

                            <Image src={'/img/battle/charity/success.svg'} width={215} height={190} alt="success" />
                        </div>

                        <div className="battle-charity-modal__btns">
                            <Button variant="active" onClick={() => togglePopup(false)} isLoading={isPending}>
                                {t('Ok')}
                            </Button>
                        </div>
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
}
