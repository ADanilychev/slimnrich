'use client';

import Lottie from 'react-lottie';

import MainLoaderAnimation from '../../../public/lotties/main_loader.json';

import './mainLoader.scss';

const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: MainLoaderAnimation,
    rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice',
    },
};

const MainLoader = () => {
    return (
        <div className="main-loader">
            <Lottie options={defaultOptions} width={270} height={270} />
        </div>
    );
};

export default MainLoader;
