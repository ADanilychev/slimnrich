'use client';

import { BuyForm } from './BuyForm/BuyForm';
import { SellForm } from './SellForm/SellForm';

import './exchangeCoinsForm.scss';

const ExchangeCoinsForm = ({ form }: { form: 'BUY' | 'SELL' }) => {
    return (
        <div className="exchange-coins-form">
            {form === 'BUY' && <BuyForm />}
            {form === 'SELL' && <SellForm />}
        </div>
    );
};

export default ExchangeCoinsForm;
