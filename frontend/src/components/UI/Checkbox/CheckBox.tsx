import React, { PropsWithChildren } from 'react';

import './checkBox.scss';

interface ICheckbox extends PropsWithChildren {
    isChecked: boolean;
    checkHandler: (value: boolean) => void;
    text?: string;
}

const Checkbox: React.FC<ICheckbox> = ({ isChecked, text, checkHandler, children }) => {
    const changeHandler = (event: React.ChangeEvent) => {
        checkHandler(!isChecked);
    };

    return (
        <label className="custom-checkbox">
            <input type="checkbox" checked={isChecked} onChange={changeHandler} />
            <div className="checkbox"></div>
            {children}
        </label>
    );
};

export default Checkbox;
