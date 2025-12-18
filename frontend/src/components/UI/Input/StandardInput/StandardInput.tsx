import { FC } from 'react';

import Input from '../Input';

import './standardInput.scss';

interface IStandardInput extends React.InputHTMLAttributes<HTMLInputElement> {
    title: string;
    isError?: boolean;
    variant?: 'default' | 'active-variant';
    showErrorIcon?: boolean;
}

const StandardInput: FC<IStandardInput> = ({ title, isError = false, showErrorIcon = true, ...props }) => {
    return (
        <div className="standard-input">
            <p>{title}</p>
            <Input showErrorIcon={showErrorIcon} isError={isError} {...props} />
        </div>
    );
};

export default StandardInput;
