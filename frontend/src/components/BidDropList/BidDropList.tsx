'use client';

import { default as cn } from 'classnames';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import { BATTLE_SLIMS, ZERO_BATTLE_SLIMS } from '@/lib/configs/CreateBattle.config';

import './bidDropList.scss';

let timerId: ReturnType<typeof setTimeout> | null = null;

const BidDropList = ({
    bid,
    setBid,
    withZeroValue = false,
}: {
    bid: number;
    setBid: (value: number) => void;
    withZeroValue?: boolean;
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectPointHandler = (point: number) => {
        setBid(point);

        timerId = setTimeout(() => {
            setIsOpen(!isOpen);
        }, 100);
    };

    const SLIM_LIST = useMemo(() => {
        return withZeroValue ? ZERO_BATTLE_SLIMS : BATTLE_SLIMS;
    }, [withZeroValue]);

    useEffect(() => {
        return () => {
            if (timerId) clearInterval(timerId);
        };
    }, []);

    return (
        <div className={cn('bid-drop-list', { 'bid-drop-list_open': isOpen })}>
            {isOpen && (
                <div className="bid-drop-list__drop">
                    <ul>
                        {SLIM_LIST.map((point) => (
                            <li
                                key={point}
                                onClick={() => selectPointHandler(point)}
                                className={cn({ selected: bid === point })}
                            >
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="bid-drop-list__current" onClick={() => setIsOpen(!isOpen)}>
                <p>{bid}</p>
                <Image src={`/img/currency/points.svg`} height={19} width={19} alt="point" />
                <Image
                    src={`/img/drop-arrow.svg`}
                    className="bid-drop-list__arrow"
                    height={15}
                    width={15}
                    alt="arrow"
                />
            </div>

            {isOpen && <div className="bid-drop-list__back-drop" onClick={() => setIsOpen(!isOpen)} />}
        </div>
    );
};

export default BidDropList;
