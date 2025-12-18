import classNames from 'classnames';
import React from 'react';

import './radioButton.scss';

interface IRadioButton {
    value: string | number;
    id: string;
    name: string;
    text: string;
    disabled?: boolean;
    checked?: boolean;
    onChange?: (value: any) => void;
    onClick?: (value: any) => void;
    type?: 'radio' | 'checkbox';
}

const RadioButton: React.FC<IRadioButton> = ({
    value,
    id,
    name,
    text,
    onChange,
    onClick,
    disabled = false,
    checked = false,
    type = 'radio',
}) => {
    return (
        <div
            className={classNames('radio-button', {
                'radio-button_disabled': disabled,
            })}
        >
            <input
                type={type}
                id={id}
                name={name}
                value={value}
                disabled={disabled}
                checked={checked}
                onChange={(event) => onChange && onChange(event.target.value)}
                onClick={(event) => onClick && onClick((event.target as any).value)}
            />
            <label htmlFor={id}>{text}</label>
        </div>
    );
};

export default RadioButton;
