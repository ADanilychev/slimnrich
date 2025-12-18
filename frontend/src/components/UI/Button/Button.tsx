import classNames from 'classnames';
import React from 'react';
import { LuLoader } from 'react-icons/lu';

import { IButton } from '@/lib/types/button.type';

import './button.scss';

const Button: React.FC<IButton> = ({
    id,
    variant,
    disabled,
    onClick,
    children,
    isLoading = false,
    loadingSize = 20,
    ...props
}) => {
    return (
        <div
            className={classNames(`button ${variant}`, { disabled: disabled || isLoading, loading: isLoading })}
            id={id}
        >
            <button onClick={onClick} disabled={disabled} {...props}>
                {isLoading ? <LuLoader size={loadingSize} className="button-spinner" /> : children}
            </button>
        </div>
    );
};

export default Button;
