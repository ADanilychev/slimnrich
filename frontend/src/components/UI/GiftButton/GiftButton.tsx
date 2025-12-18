import Image from 'next/image';
import React, { PropsWithChildren } from 'react';

import { IButton } from '@/lib/types/button.type';

import Button from '../Button/Button';

import './giftButton.scss';

type ButtonProps = Omit<IButton, 'variant'>;

type Props = PropsWithChildren & ButtonProps;

interface CustomProps extends Props {
    iconSize?: number;
}

export default function GiftButton({ children, iconSize = 18, ...props }: CustomProps) {
    return (
        <Button variant={'stroke'} {...props} className="gift-button">
            <Image src={`/img/currency/crystals.svg`} height={iconSize} width={iconSize} alt="crystals" />
            {children}
        </Button>
    );
}
