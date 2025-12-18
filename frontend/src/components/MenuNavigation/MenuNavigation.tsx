'use client';

import { default as cn } from 'classnames';
import { AnimatePresence, m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { match } from 'path-to-regexp';
import { useEffect, useRef, useState } from 'react';

import { useModal } from '@/context/useModalContext';

import { ROUTES, SETTINGS_TYPE } from '@/lib/constants/Routes';
import { PopupDirection, PopupTypes } from '@/lib/types/ModalContext.type';

import BattleSvg from '../../../public/img/menu-navigation/battle.svg';
import ExchangeSvg from '../../../public/img/menu-navigation/exchange.svg';
import MainCloseSvg from '../../../public/img/menu-navigation/main-close.svg';
import MainSvg from '../../../public/img/menu-navigation/main.svg';
import ProfileSvg from '../../../public/img/menu-navigation/profile.svg';
import StatisticSvg from '../../../public/img/menu-navigation/statistics.svg';

import { Link, usePathname } from '@/i18n/routing';

import './menuNavigation.scss';

const menuNavigation = [
    {
        icon: <StatisticSvg />,
        text: 'Statistics',
        path: ROUTES.STATISTICS,
    },
    {
        icon: <BattleSvg />,
        text: 'Battle',
        path: ROUTES.BATTLE,
    },
    {
        icon: <ExchangeSvg />,
        text: 'Exchange',
        path: ROUTES.EXCHANGE,
    },
    {
        icon: <ProfileSvg />,
        text: 'Profile',
        path: ROUTES.PROFILE,
    },
];

const animationVariants = {
    rotate: { rotate: -180 },
    stop: { rotate: 0 },
};

let timerId: NodeJS.Timeout;

const MenuNavigation = () => {
    const t = useTranslations('MenuNavigation');

    const pathname = usePathname();
    const { togglePopup, popupType, isOpenPopup } = useModal();

    const [isStartAnimation, setIsStartAnimation] = useState(false);

    const [showSubButtons, setShowSubButtons] = useState(false);
    const menuNavigationRef = useRef<HTMLDivElement>(null);

    const renderLinks = (links: typeof menuNavigation) => {
        return links.slice(0, 2).map((link) => (
            <Link
                key={link.path}
                className={cn('menu-navigation__item', {
                    'menu-navigation__item_active': match(link.path + '{/*other}')(pathname),
                })}
                href={link.path}
            >
                {link.icon}
                <p>{t(link.text)}</p>
            </Link>
        ));
    };

    const toggleMainPopupHandler = () => {
        if (menuNavigationRef.current) {
            menuNavigationRef.current.style.zIndex = '10010';
        }

        if (!isOpenPopup) togglePopup(true, PopupTypes.Empty, '', PopupDirection.TopToBottom);
        else togglePopup(false);

        setShowSubButtons(!isOpenPopup);
        setIsStartAnimation(!isOpenPopup);
    };

    const openRecordWeight = () => {
        setShowSubButtons(false);

        timerId = setTimeout(() => {
            togglePopup(true, PopupTypes.RecordWeight, '', PopupDirection.TopToBottom);
        }, 300);
    };

    const openPhotoFood = () => {
        setShowSubButtons(false);

        timerId = setTimeout(() => {
            togglePopup(true, PopupTypes.PhotoFoodPopup, '', PopupDirection.TopToBottom);
        }, 300);
    };

    const openPhotoLifestyle = () => {
        setShowSubButtons(false);

        timerId = setTimeout(() => {
            togglePopup(true, PopupTypes.PhotoLifeStylePopup, '', PopupDirection.TopToBottom);
        }, 300);
    };

    useEffect(() => {
        if (
            popupType !== PopupTypes.Empty &&
            popupType !== PopupTypes.RecordWeight &&
            popupType !== PopupTypes.PhotoFoodPopup &&
            popupType !== PopupTypes.PhotoLifeStylePopup
        )
            return;
        setIsStartAnimation(isOpenPopup);

        setShowSubButtons(
            popupType === PopupTypes.RecordWeight ||
                popupType === PopupTypes.PhotoFoodPopup ||
                popupType === PopupTypes.PhotoLifeStylePopup
                ? false
                : isOpenPopup,
        );

        return () => {
            clearTimeout(timerId);
        };
    }, [popupType, isOpenPopup]);

    return (
        <div className="menu-navigation" ref={menuNavigationRef}>
            <div className="menu-navigation__wrapper">
                {renderLinks(menuNavigation.slice(0, 2))}
                <div className="menu-navigation__item menu-navigation__item_main">
                    <div className="main-button-wrapper">
                        <AnimatePresence>
                            {showSubButtons && (
                                <div className="main-button-wrapper__sub-wrapper">
                                    <m.div
                                        initial={{ opacity: 0, x: 0, y: 0 }}
                                        animate={{ opacity: 1, x: -50, y: -30 }}
                                        exit={{ opacity: 0, x: 0, y: 0 }}
                                        transition={{
                                            delay: 0.1,
                                        }}
                                        className="main-button-wrapper__sub-btn"
                                        onClick={openRecordWeight}
                                    >
                                        <Image
                                            src={'/img/menu/weight.svg'}
                                            width={25}
                                            height={25}
                                            alt="height"
                                            quality={90}
                                        />
                                    </m.div>
                                    <m.div
                                        initial={{ opacity: 0, x: 10, y: 0 }}
                                        animate={{ opacity: 1, x: 10, y: -60 }}
                                        exit={{ opacity: 0, x: 10, y: 0 }}
                                        transition={{
                                            delay: 0.2,
                                        }}
                                        className="main-button-wrapper__sub-btn"
                                        onClick={openPhotoFood}
                                    >
                                        <Image
                                            src={'/img/menu/food.svg'}
                                            width={25}
                                            height={25}
                                            alt="height"
                                            quality={90}
                                        />
                                    </m.div>
                                    <m.div
                                        initial={{ opacity: 0, x: 25, y: 0 }}
                                        animate={{ opacity: 1, x: 70, y: -30 }}
                                        exit={{ opacity: 0, x: 25, y: 0 }}
                                        transition={{
                                            delay: 0.3,
                                        }}
                                        className="main-button-wrapper__sub-btn"
                                        onClick={openPhotoLifestyle}
                                    >
                                        <Image
                                            src={'/img/menu/lifestyle.svg'}
                                            width={25}
                                            height={25}
                                            alt="height"
                                            quality={90}
                                        />
                                    </m.div>
                                </div>
                            )}
                        </AnimatePresence>

                        <m.div
                            className="main-button-wrapper__main"
                            animate={isStartAnimation ? 'rotate' : 'stop'}
                            variants={animationVariants}
                            transition={{ type: 'spring', duration: 0.3, damping: 10 }}
                            onClick={toggleMainPopupHandler}
                        >
                            {isStartAnimation ? <MainCloseSvg /> : <MainSvg />}
                        </m.div>
                    </div>

                    <Link className="menu-navigation__get-money" href={ROUTES.SETTINGS(SETTINGS_TYPE.GET_MONEY)}>
                        {t('GetMoney')}
                    </Link>
                </div>
                {renderLinks(menuNavigation.slice(2, 4))}
            </div>
        </div>
    );
};

export default MenuNavigation;
