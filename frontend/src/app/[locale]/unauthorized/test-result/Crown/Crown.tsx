import React from 'react';

import './crown.scss';

import Image from 'next/image';

const Crown = () => {
    return (
        <div className="crown">
            <Image src={'/img/crown.svg'} quality={50} width={30} height={30} alt="crown" />
        </div>
    );
};

export default Crown;
