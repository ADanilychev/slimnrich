import Image from 'next/image';
import { FC, PropsWithChildren } from 'react';

import ControlHeader from './ControlHeader/ControlHeader';
import { Link } from '@/i18n/routing';

import './controls.scss';

interface IControl {
    ico: string;
    text: string;
    link: string;
    clickHandler: (() => void) | null;
}

const Control: FC<IControl> = ({ link, text, ico, clickHandler }) => {
    return (
        <ControlElement ico={ico} text={text} link={link} clickHandler={clickHandler}>
            <ControlHeader text={text} ico={ico} />

            <div className="btn-control__arrow">
                <Image src={'/img/profileControls/arrow.svg'} width={9} height={15} alt="arrow" />
            </div>
        </ControlElement>
    );
};

type TControlElement = IControl & PropsWithChildren;

const ControlElement = ({ clickHandler, link, children }: TControlElement) => {
    if (clickHandler) {
        return (
            <div className="btn-control" onClick={clickHandler}>
                {children}
            </div>
        );
    }

    return (
        <Link href={link} className="btn-control">
            {children}
        </Link>
    );
};

export default Control;
