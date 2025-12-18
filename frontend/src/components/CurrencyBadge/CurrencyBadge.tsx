import Image from 'next/image';
import { FC } from 'react';

import { CurrencyTypes } from '@/lib/types/Currency.type';

import './currencyBadge.scss';

interface ICurrencyBadge extends React.HTMLAttributes<HTMLDivElement> {
    type: CurrencyTypes;
    count?: number;
}

const CurrencyBadge: FC<ICurrencyBadge> = ({ type, count = 0, ...props }) => {
    return (
        <div className="currency-badge" {...props}>
            <Image src={`/img/currency/${type}.svg`} height={25} width={25} alt="currency" />
            <p>{count}</p>

            {type === CurrencyTypes.CRYSTALS && (
                <Image
                    src="/img/currency/document.svg"
                    width={16}
                    height={16}
                    alt="info"
                    className="currency-badge__info"
                />
            )}
        </div>
    );
};

export default CurrencyBadge;
