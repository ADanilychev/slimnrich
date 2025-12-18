import { useTranslations } from 'next-intl';
import React from 'react';

import Lenta1SVG from '../../../../../../public/img/lenta/lenta-1.svg';
import Lenta2SVG from '../../../../../../public/img/lenta/lenta-2.svg';
import Lenta3SVG from '../../../../../../public/img/lenta/lenta-3.svg';
import Lenta4SVG from '../../../../../../public/img/lenta/lenta-4.svg';
import Lenta5SVG from '../../../../../../public/img/lenta/lenta-5.svg';

import './lenta.scss';

const Lenta = () => {
    const t = useTranslations('WelcomePage.Lenta');

    return (
        <div className="start-lenta">
            <div className="start-lenta__wrapper">
                <div className="start-lenta__item">
                    <Lenta1SVG />
                    <div className="start-lenta__info">
                        <p>{t('First.Name')}</p>
                        <small>
                            {t.rich('First.text', {
                                b: (chunks) => <b>{chunks}</b>,
                            })}
                        </small>
                    </div>
                </div>
                <div className="start-lenta__item">
                    <Lenta2SVG />
                    <div className="start-lenta__info">
                        <p>{t('Second.Name')}</p>
                        <small>
                            {t.rich('Second.text', {
                                b: (chunks) => <b>{chunks}</b>,
                            })}
                        </small>
                    </div>
                </div>
                <div className="start-lenta__item">
                    <Lenta3SVG />
                    <div className="start-lenta__info">
                        <p>{t('Third.Name')}</p>
                        <small>
                            {t.rich('Third.text', {
                                b: (chunks) => <b>{chunks}</b>,
                            })}
                        </small>
                    </div>
                </div>
                <div className="start-lenta__item">
                    <Lenta4SVG />
                    <div className="start-lenta__info">
                        <p>{t('Fourth.Name')}</p>
                        <small>
                            {t.rich('Fourth.text', {
                                b: (chunks) => <b>{chunks}</b>,
                            })}
                        </small>
                    </div>
                </div>
                <div className="start-lenta__item">
                    <Lenta5SVG />
                    <div className="start-lenta__info">
                        <p>{t('Second.Name')}</p>
                        <small>
                            {t.rich('Second.text', {
                                b: (chunks) => <b>{chunks}</b>,
                            })}
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Lenta;
