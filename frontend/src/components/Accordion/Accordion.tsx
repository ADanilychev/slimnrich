import { PropsWithChildren } from 'react';

import './accordion.scss';

interface Props extends PropsWithChildren {
    className?: string;
}

export function Accordion({ children, className }: Props) {
    return <div className={`accordion ${className ? className : ''}`}>{children}</div>;
}
