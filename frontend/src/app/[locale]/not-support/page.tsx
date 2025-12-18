'use client';

import { useEffect } from 'react';

import MainLoader from '@/components/MainLoader/MainLoader';

import { useModal } from '@/context/useModalContext';

import { PopupTypes } from '@/lib/types/ModalContext.type';

let timerId: NodeJS.Timeout;

const Page = () => {
    const { togglePopup } = useModal();

    useEffect(() => {
        timerId = setTimeout(() => {
            togglePopup(true, PopupTypes.NotSupport);
        }, 500);

        return () => {
            clearTimeout(timerId);
        };
    }, []);

    return <MainLoader />;
};

export default Page;
