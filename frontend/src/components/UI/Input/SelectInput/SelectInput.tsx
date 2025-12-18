import Image from 'next/image';
import React, { ReactNode, useEffect, useState } from 'react';

import cn from '@/lib/import/classnames';

import LockSVG from '../../../../../public/img/lock.svg';
import Input from '../Input';
import InputWithTitle from '../InputWithTitle/InputWithTitle';

import './select-input.scss';

interface ISelectInput<DataType, ElementType> extends React.InputHTMLAttributes<HTMLInputElement> {
    title?: string;
    blocked?: boolean;
    isError?: boolean;
    variant?: 'default' | 'active-variant';
    data: DataType;
    selectedElement?: ElementType;
    onSelectHandler: (item: ElementType) => void;
    render: (item: ElementType) => ReactNode;
    displayFn?: (item: ElementType | undefined) => string;
    preIcon?: React.ReactNode;
}

let timerId: NodeJS.Timeout;

export function SelectInput<DataType, ElementType>({
    onSelectHandler,
    selectedElement,
    blocked = false,
    data,
    title,
    isError,
    render,
    displayFn,
    preIcon,
    ...props
}: ISelectInput<DataType[], ElementType>) {
    const [isOpen, setIsOpen] = useState(false);

    const selectHandler = (element: ElementType) => {
        onSelectHandler(element);

        timerId = setTimeout(() => {
            openHandler();
        }, 200);
    };

    const openHandler = () => {
        if (blocked) return;

        setIsOpen(!isOpen);
    };

    useEffect(() => {
        return () => {
            clearTimeout(timerId);
        };
    }, []);

    return (
        <div className="select-input">
            {title ? (
                <InputWithTitle
                    onClick={openHandler}
                    preIcon={preIcon}
                    title={title || ''}
                    isError={isError}
                    {...props}
                    readOnly
                    value={displayFn ? displayFn(selectedElement) : (selectedElement as string)}
                />
            ) : (
                <Input
                    onClick={openHandler}
                    preIcon={preIcon}
                    isError={isError}
                    {...props}
                    readOnly
                    value={displayFn ? displayFn(selectedElement) : (selectedElement as string)}
                />
            )}
            {blocked ? (
                <div
                    className="select-input__block-icon"
                    style={{
                        top: title ? 'calc(50% + 5px)' : 'calc(37%)',
                    }}
                >
                    <LockSVG />
                </div>
            ) : (
                <Image
                    className={cn('select-input__arrow', {
                        'select-input__arrow_open': isOpen,
                    })}
                    onClick={openHandler}
                    src={'/img/drop-arrow.svg'}
                    quality={100}
                    width={15}
                    height={15}
                    alt="arrow"
                    style={{
                        top: title ? 'calc(50% + 5px)' : 'calc(37%)',
                    }}
                />
            )}

            <div className="select-input__drop-list" style={{ display: isOpen ? 'flex' : 'none' }}>
                {data.map((item, index) => (
                    <div
                        key={index}
                        className={cn('drop-list__item', {
                            active:
                                typeof selectedElement === 'object'
                                    ? (item as { value: unknown }).value ===
                                      (selectedElement as { value: unknown }).value
                                    : item === selectedElement,
                        })}
                        data-value={item}
                        onClick={() => selectHandler(item as unknown as ElementType)}
                    >
                        {render(item as unknown as ElementType)}
                    </div>
                ))}
            </div>
            {isOpen && <div className="overlay" onClick={() => setIsOpen(!isOpen)} />}
        </div>
    );
}
