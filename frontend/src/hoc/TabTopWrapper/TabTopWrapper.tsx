import { FC, PropsWithChildren } from 'react';
import { default as cn } from 'classnames';

import './tabTopWrapper.scss';

interface ITabTopWrapper extends PropsWithChildren {
    className?: string;
}

const TabTopWrapper: FC<ITabTopWrapper> = ({ children, className }) => {
    return <div className={cn('tab-top-wrapper', className)}>{children}</div>;
};

export default TabTopWrapper;
