import { default as cn } from 'classnames';
import Image from 'next/image';
import React from 'react';

import { ITimeZoneItem } from '@/lib/types/timezone.type';

import OkSVG from '../../../../../public/img/ok.svg';
import TZIcon from '../../../../../public/img/tz-icon.svg';
import Input from '../Input';

import './timeZoneInput.scss';

interface ITimeZoneInput {
    value: number | null;
    setValue: (value: number | null) => void;
    timeZoneList: ITimeZoneItem[];
}

const TimeZoneInput: React.FC<ITimeZoneInput> = ({ value, setValue, timeZoneList }) => {
    const [searchString, setSearchString] = React.useState('');
    const [isOpenDropList, setIsOpenDropList] = React.useState(false);

    const [filterTimeZone, setFilterTimeZone] = React.useState(timeZoneList);

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value;

        setSearchString(value);

        let updatedList = timeZoneList;
        if (value.length) {
            updatedList = filterTimeZone.filter((x) => x.text.toLowerCase().includes(value.toLocaleLowerCase()));
        }
        setFilterTimeZone(updatedList);
    };

    const selectTimeZone = (value: number) => {
        setValue(value);
        setIsOpenDropList(false);
        setSearchString(value > 0 ? '+' + value.toString() : value.toString());
    };

    React.useEffect(() => {
        if (value) setSearchString(value > 0 ? '+' + value.toString() : value.toString());
    }, [value]);

    return (
        <div className="timezone-wrapper">
            <div className="timezone-wrapper__input">
                <Input
                    value={searchString}
                    onChange={onChange}
                    inputMode="search"
                    onFocus={() => setIsOpenDropList(true)}
                    preIcon={
                        <>
                            <TZIcon />
                            <p>UTC</p>
                        </>
                    }
                />
            </div>
            <div
                className={cn('timezone-wrapper__drop-list', {
                    'timezone-wrapper__drop-list_open': isOpenDropList,
                })}
            >
                {filterTimeZone.map((tz) => (
                    <div
                        className={cn('drop-list__item', {
                            'drop-list__item_selected': tz.value === value,
                        })}
                        onClick={() => selectTimeZone(tz.value)}
                        key={tz.value}
                    >
                        <Image src={tz.icon} width={28} height={20} alt="flag" />
                        <p>{tz.text}</p>

                        {tz.value === value && <OkSVG />}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TimeZoneInput;
