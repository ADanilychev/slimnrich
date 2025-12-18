import { useTranslations } from 'next-intl';
import React from 'react';

import { BMIList } from '@/lib/configs/BMI.config';

import { useTestStore } from '@/store/test.store';

import './bmi_progressBar.scss';

interface IBMIProgressBar {
    BMI_value: number;
    userWeight: number;
}

const BMIProgressBar: React.FC<IBMIProgressBar> = ({ BMI_value = 0, userWeight }) => {
    const t = useTranslations('BMIProgressBar');
    const { numbers } = useTestStore((store) => store.stepForm);

    const currentPointPosition = React.useMemo(() => {
        const currentWeight = BMIList.findLast((x) => x.from <= BMI_value && x.to >= BMI_value);
        let width = 0;
        let section = '';

        if (currentWeight) {
            section = t('BMIList.' + currentWeight?.title);
            width = (100 * (BMI_value - currentWeight.from)) / (currentWeight.to - currentWeight?.from);
        } else {
            if (BMI_value < 16) {
                section = t('BMIList.' + BMIList[0].title);
                width = 0;
            }

            if (BMI_value > 40) {
                section = t('BMIList.' + BMIList[3].title);
                width = 100;
            }
        }

        return {
            section,
            width,
        };
    }, [BMI_value]);

    return (
        <div className="imb-progress">
            <div className="imb-progress__top">
                <div className="imb-progress__section">
                    <small>{t('Weight')}</small>
                    <p>
                        {userWeight} {numbers}
                    </p>
                </div>
                <div className="imb-progress__section">
                    <small>{t('BMI')}</small>
                    <p>{BMI_value}</p>
                </div>
                <div className="imb-progress__section">
                    <small>{t('Status')}</small>
                    <p>{currentPointPosition.section}</p>
                </div>
            </div>

            <div className="imb-progress__line">
                {BMIList.map((item, index) => (
                    <div className="line-section" style={{ width: item.percentWidth + '%' }} key={index}>
                        {currentPointPosition.section === t('BMIList.' + item.title) && (
                            <div
                                className="line-section__pointer"
                                style={{ left: `calc(${currentPointPosition.width + '%'} - 8px)` }}
                            ></div>
                        )}

                        <span style={{ background: item.color }}></span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BMIProgressBar;
