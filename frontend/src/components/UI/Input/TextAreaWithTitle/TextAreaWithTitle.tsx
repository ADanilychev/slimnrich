import { default as cn } from 'classnames';
import React from 'react';

import './textAreaWithTitle.scss';

interface TextAreaWithTitleProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    title: string;
    row?: number;
}

const TextAreaWithTitle: React.FC<TextAreaWithTitleProps> = ({ title, row = 2, ...props }) => {
    return (
        <div className={cn('textarea-with-title')}>
            <p className="textarea-with-title__title">{title}</p>
            <textarea rows={row} {...props}></textarea>
        </div>
    );
};

export default TextAreaWithTitle;
