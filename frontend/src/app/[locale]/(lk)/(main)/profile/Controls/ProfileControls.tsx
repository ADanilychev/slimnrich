'use client';

import { Fragment, use } from 'react';

import { useModal } from '@/context/useModalContext';

import { ROUTES, SETTINGS_TYPE } from '@/lib/constants/Routes';
import { PopupTypes } from '@/lib/types/ModalContext.type';

import Control from './Controls';

export function ProfileControls({
    list,
}: {
    list: Promise<
        {
            ico: string;
            text: string;
            slug: SETTINGS_TYPE;
        }[]
    >;
}) {
    const { togglePopup } = useModal();
    const settingControl = use(list);
    const openDeleteAccountHandler = () => {
        togglePopup(true, PopupTypes.DeleteAccount);
    };

    return (
        <div className="profile-page__controls">
            {settingControl?.map((item) => (
                <Fragment key={item.text}>
                    {item.slug !== SETTINGS_TYPE.GET_MONEY && (
                        <Control
                            ico={item.ico}
                            text={item.text}
                            link={item.slug === SETTINGS_TYPE.DELETE_ACCOUNT ? '#' : ROUTES.SETTINGS(item.slug)}
                            clickHandler={item.slug === SETTINGS_TYPE.DELETE_ACCOUNT ? openDeleteAccountHandler : null}
                        />
                    )}
                </Fragment>
            ))}
        </div>
    );
}
