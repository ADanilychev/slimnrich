import Image from 'next/image';

import './controlHeader.scss';

interface Props {
    ico: string;
    text: string;
}

const ControlHeader = ({ ico, text }: Props) => {
    return (
        <div className="control-header">
            <div className="control-header__ico">
                <Image src={ico} width={15} height={15} alt="test" />
            </div>
            <p className="control-header__text">{text}</p>
        </div>
    );
};

export default ControlHeader;
