import { default as cn } from 'classnames';
import Image from 'next/image';
import { FC, InputHTMLAttributes, ReactNode } from 'react';
import { Tooltip } from 'react-tooltip';

import LockSVG from '../../../../public/img/lock.svg';

import './input.scss';

export interface IInput extends InputHTMLAttributes<HTMLInputElement> {
    preIcon?: ReactNode;
    isError?: boolean;
    showErrorIcon?: boolean;
    mask?: string;
    block?: boolean;
    errorMessage?: string | null;
    showErrorTooltip?: boolean;
}

const Input: FC<IInput> = ({
    mask,
    preIcon,
    block = false,
    isError = false,
    showErrorIcon = true,
    errorMessage,
    showErrorTooltip = false,
    ...props
}) => {
    return (
        <div className={cn('base-input', { 'base-input_error': isError, 'base-input_lock': block })}>
            {((showErrorIcon && isError) || preIcon) && (
                <div className="base-input__pre-icon">
                    {isError ? <Image src={'/img/error-input.svg'} width={16} height={16} alt="err" /> : preIcon}
                </div>
            )}
            <input type="text" disabled={props.disabled || block} {...props} />
            {block && (
                <div className="base-input__post-icon">
                    <LockSVG />
                </div>
            )}

            {showErrorTooltip && (
                <Tooltip
                    anchorSelect={`#${props.id}`}
                    variant="error"
                    style={{ maxWidth: '150px', textAlign: 'center' }}
                >
                    {errorMessage}
                </Tooltip>
            )}
        </div>
    );
};

export default Input;
