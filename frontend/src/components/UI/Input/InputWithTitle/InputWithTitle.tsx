import { default as cn } from 'classnames';
import React from 'react';

import Input, { IInput } from '../Input';

import './inputWithTitle.scss';

interface InputWithTitle extends React.InputHTMLAttributes<HTMLInputElement>, IInput {
    title: string;
    isError?: boolean;
    variant?: 'default' | 'active-variant';
    block?: boolean;
    errorMessage?: string | null;
    showErrorTooltip?: boolean;
}

const InputWithTitle: React.FC<InputWithTitle> = ({
    title,
    block = false,
    variant = 'default',
    isError = false,
    ...props
}) => {
    return (
        <div className={cn('input-with-title', variant)}>
            <p className="input-with-title__title">{title}</p>
            <Input isError={isError} {...props} block={block} />
        </div>
    );
};

export default InputWithTitle;
