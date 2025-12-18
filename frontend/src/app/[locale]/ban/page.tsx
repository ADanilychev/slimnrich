'use client';

import { useEffect } from 'react';

import MainLoader from '@/components/MainLoader/MainLoader';

import { useModal } from '@/context/useModalContext';

import { PopupTypes } from '@/lib/types/ModalContext.type';

import { useProfile } from '@/hooks/react-queries/useProfile';

let timerId: NodeJS.Timeout;

const Page = () => {
    const { data } = useProfile();
    const { togglePopup } = useModal();

    useEffect(() => {
        if (!data) return;

        if (data.is_banned) {
            timerId = setTimeout(() => {
                togglePopup(true, PopupTypes.Ban, data.banned);
            }, 500);
        }

        return () => {
            clearTimeout(timerId);
        };
    }, [data]);

    return <MainLoader />;
};

export default Page;
