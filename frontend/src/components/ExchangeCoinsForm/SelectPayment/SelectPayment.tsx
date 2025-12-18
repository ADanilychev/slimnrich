'use client';

import { default as cn } from 'classnames';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';

import { ExchangePaymentConfig, TPaymentMethod } from '@/lib/configs/Payment.config';

import './selectPayment.scss';

const SelectPayment = ({
    onChange,
    selected,
    type,
}: {
    onChange: (value: (typeof ExchangePaymentConfig)[0]) => void;
    selected: TPaymentMethod;
    type: 'buy' | 'sell';
}) => {
    const t = useTranslations('SelectPayment');
    const [selectedPayment, setSelectedPayment] = useState<TPaymentMethod>(selected);

    const selectPayment = (payment: (typeof ExchangePaymentConfig)[0]) => {
        setSelectedPayment(payment.type);
        onChange(payment);
    };

    return (
        <div className="select-payment">
            <p className="input-with-title__title select-payment__title">{t('Title')}</p>

            {ExchangePaymentConfig.map((payment, index) => (
                <button
                    className={cn('select-payment__item', { active: selectedPayment === payment.type })}
                    onClick={() => selectPayment(payment)}
                    key={index}
                    disabled={payment.type === 'card'}
                >
                    <div className="select-payment__left">
                        <p> {t(payment.type + `.title_${type}`)}</p>
                        <p> {t(payment.type + `.subTitle_${type}`)}</p>
                    </div>
                    <div className="select-payment__right">
                        <Image
                            src={payment.img}
                            width={112}
                            height={32}
                            alt={payment[`title_${type}` as keyof (typeof ExchangePaymentConfig)[0]]}
                        />
                        <p>{payment.more}</p>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default SelectPayment;
