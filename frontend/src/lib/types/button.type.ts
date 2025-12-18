import { ButtonHTMLAttributes, PropsWithChildren } from 'react';

export interface IButton extends PropsWithChildren, ButtonHTMLAttributes<HTMLButtonElement> {
    variant: TButtonVariant;
    isLoading?: boolean;
    loadingSize?: number;
}

export type TButtonVariant =
    | 'active'
    | 'disabled'
    | 'stroke'
    | 'stroke-red'
    | 'orange'
    | 'transparent'
    | 'green'
    | 'gradient'
    | 'red'
    | 'disabled-variant'
    | 'blue'
    | 'violet';
