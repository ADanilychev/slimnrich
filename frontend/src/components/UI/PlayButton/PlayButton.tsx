import { IoPlay } from 'react-icons/io5';

import cn from '@/lib/import/classnames';
import { IButton } from '@/lib/types/button.type';

import Button from '../Button/Button';

import './playButton.scss';

export function PlayButton({
    children,
    className,
    iconSize,
    ...props
}: Omit<IButton, 'variant'> & { iconSize?: number }) {
    return (
        <Button type="button" {...props} variant={'violet'} className={cn('play-button', className)}>
            <IoPlay fill="white" size={iconSize ?? 32} style={{ marginRight: -4 }} />
            {children}
        </Button>
    );
}
