import Image from 'next/image';
import React, { FC, PropsWithChildren, ReactNode } from 'react';

import './baseHint.scss';

interface IBaseHint extends PropsWithChildren {
    type: 'error' | 'success';
    className?: string;
}

const BaseHint: FC<IBaseHint> = ({ children, type = 'success', className }) => {
    return (
        <div className={`base-hint base-hint__${type} ${className ? className : ''}`}>
            <Image width={24} height={24} src={`/img/ok-${type}.svg`} alt={type} />
            {children}
        </div>
    );
};

export default BaseHint;
