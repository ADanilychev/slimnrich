'use client';

import { m, useAnimate } from 'framer-motion';
import dynamic from 'next/dynamic';
import React, { NamedExoticComponent } from 'react';

import { BattleCharity } from '@/components/Modals/BattleCharity/BattleCharity';
import { BattleMotivation } from '@/components/Modals/BattleMotivation/BattleMotivation';
import EditProfile from '@/components/Modals/EditProfile/EditProfile';
import { NotEnoughMoney } from '@/components/Modals/NotEnoughMoney/NotEnoughMoney';
import { NotUserPremium } from '@/components/Modals/NotUserPremium/NotUserPremium';
import { PhotoGalleryModal } from '@/components/Modals/PhotoGalleryModal/PhotoGalleryModal';
import SelectLanguageModal from '@/components/Modals/SelectLanguage/SelectLanguageModal';
import { PhotoFoodPopup } from '@/components/Popups/PhotoFoodPopup/PhotoFoodPopup';
import { PhotoLifestylePopup } from '@/components/Popups/PhotoLifestyle/PhotoLifestylePopup';
import { RecordWeightPopup } from '@/components/Popups/RecordWeightPopup/RecordWeightPopup';

import { IModalContext, PopupDirection, PopupTypes } from '@/lib/types/ModalContext.type';

const CreateUniqueRepostDynamic = dynamic(() =>
    import('@/components/Modals/CreateUniqueRepost/CreateUniqueRepost').then((mod) => mod.CreateUniqueRepost),
);
const AddBloggerDynamic = dynamic(() =>
    import('@/components/Modals/AddBlogger/AddBlogger').then((mod) => mod.AddBlogger),
);
const AddModeratorDynamic = dynamic(() =>
    import('@/components/Modals/AddModerator/AddModerator').then((mod) => mod.AddModerator),
);
const BanModalDynamic = dynamic(() => import('@/components/Modals/BanModal/BanModal').then((mod) => mod.BanModal));
const UnBanModalDynamic = dynamic(() =>
    import('@/components/Modals/UnBanModal/UnBanModal').then((mod) => mod.UnBanModal),
);
const SetUserBanDynamic = dynamic(() =>
    import('@/components/Modals/SetUserBan/SetUserBan').then((mod) => mod.SetUserBan),
);
const RemoveModeratorDynamic = dynamic(() =>
    import('@/components/Modals/RemoveModerator/RemoveModerator').then((mod) => mod.RemoveModerator),
);
const RemoveBloggerDynamic = dynamic(() =>
    import('@/components/Modals/RemoveBlogger/RemoveBlogger').then((mod) => mod.RemoveBlogger),
);
const CancelBattleDynamic = dynamic(() =>
    import('@/components/Modals/CancelBattle/CancelBattle').then((mod) => mod.CancelBattle),
);
const SendUserReportDynamic = dynamic(() =>
    import('@/components/Modals/SendUserReport/SendUserReport').then((mod) => mod.SendUserReport),
);
const NewAchievementDynamic = dynamic(() =>
    import('@/components/Modals/NewAchievement/NewAchievement').then((mod) => mod.NewAchievement),
);
const DeleteAccountDynamic = dynamic(() =>
    import('@/components/Modals/DeleteAccount/DeleteAccount').then((mod) => mod.DeleteAccount),
);
const NotSupportDynamic = dynamic(() =>
    import('@/components/Modals/NotSupport/NotSupport').then((mod) => mod.NotSupport),
);

export const ModalContext = React.createContext<IModalContext>({
    isOpenPopup: false,
    togglePopup: () => {},
    popupType: null,
});

let { Provider } = ModalContext;

interface IModalContextProvider {
    children: React.ReactNode;
}

export const _ModalContextProvider: NamedExoticComponent<IModalContextProvider> = React.memo(({ children }) => {
    const [isOpenPopup, setIsOpenPopup] = React.useState<boolean>(false);
    const [popupType, setPopupType] = React.useState<PopupTypes | null>(null);
    const [popupPayload, setPopupPayload] = React.useState<any | null>();
    const [direction, setDirection] = React.useState<PopupDirection>(PopupDirection.Center);

    const [scope, animate] = useAnimate();

    const closeHandler = async () => {
        animate(scope.current, {
            opacity: [1, 0],
        });

        const scaleAnimation = [1, direction === PopupDirection.Center ? 0.9 : 1];
        const yAnimation = [
            0,
            direction === PopupDirection.BottomToTop ? '100%' : direction === PopupDirection.TopToBottom ? '-100%' : 0,
        ];

        await animate('#modal-wrapper', {
            scale: scaleAnimation,
            y: yAnimation,
        });

        setIsOpenPopup(false);

        setPopupType(popupType);
        setPopupPayload(null);
    };

    const togglePopup = (
        flag: boolean,
        popupType: PopupTypes | null = null,
        payload: any = null,
        direction: PopupDirection = PopupDirection.Center,
    ) => {
        if (!flag) {
            closeHandler();
        } else {
            setDirection(direction);
            setPopupType(popupType);
            setIsOpenPopup(true);
        }

        if (payload) setPopupPayload(payload);
    };

    const renderPopup = () => {
        switch (popupType) {
            case PopupTypes.SelectLanguageModal:
                return <SelectLanguageModal />;
            case PopupTypes.EditProfile:
                return <EditProfile />;
            case PopupTypes.RecordWeight:
                return <RecordWeightPopup />;
            case PopupTypes.NotEnoughMoney:
                return <NotEnoughMoney />;
            case PopupTypes.NotUserPremium:
                return <NotUserPremium />;
            case PopupTypes.SendUserReport:
                return <SendUserReportDynamic userId={popupPayload} />;
            case PopupTypes.UserPhotoGallery:
                return <PhotoGalleryModal item={popupPayload} />;
            case PopupTypes.NewAchievement:
                return <NewAchievementDynamic list={popupPayload} />;
            case PopupTypes.CancelBattle:
                return <CancelBattleDynamic battle_type={popupPayload} />;
            case PopupTypes.Ban:
                return <BanModalDynamic ban_timestamp={popupPayload} />;
            case PopupTypes.BattleMotivation:
                return <BattleMotivation />;
            case PopupTypes.BattleCharity:
                return <BattleCharity />;
            case PopupTypes.RemoveModerator:
                return <RemoveModeratorDynamic moderator={popupPayload} />;
            case PopupTypes.AddModerator:
                return <AddModeratorDynamic />;
            case PopupTypes.SetUserBan:
                return <SetUserBanDynamic payload={popupPayload} />;
            case PopupTypes.UnBanUser:
                return <UnBanModalDynamic user_id={popupPayload} />;
            case PopupTypes.AddBlogger:
                return <AddBloggerDynamic />;
            case PopupTypes.RemoveBlogger:
                return <RemoveBloggerDynamic blogger={popupPayload} />;
            case PopupTypes.PhotoFoodPopup:
                return <PhotoFoodPopup />;
            case PopupTypes.PhotoLifeStylePopup:
                return <PhotoLifestylePopup />;
            case PopupTypes.DeleteAccount:
                return <DeleteAccountDynamic />;
            case PopupTypes.NotSupport:
                return <NotSupportDynamic />;
            case PopupTypes.CreateUniqueRepost:
                return <CreateUniqueRepostDynamic fileId={popupPayload} />;
            case PopupTypes.Empty:
                return <></>;
        }
    };

    return (
        <Provider
            value={{
                isOpenPopup,
                togglePopup,
                popupType,
            }}
        >
            {isOpenPopup && (
                <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`popup-wrapper popup-wrapper__active`}
                    onClick={closeHandler}
                    ref={scope}
                >
                    <m.div
                        id="modal-wrapper"
                        onClick={(e) => e.stopPropagation()}
                        initial={{
                            scale: direction === PopupDirection.Center ? 0.9 : 1,
                            y:
                                direction === PopupDirection.BottomToTop
                                    ? '100%'
                                    : direction === PopupDirection.TopToBottom
                                      ? '-100%'
                                      : 0,
                        }}
                        animate={{ scale: 1, y: direction === PopupDirection.BottomToTop ? 0 : 0 }}
                        transition={{
                            type: direction === PopupDirection.Center ? 'spring' : 'tween',
                        }}
                        className={`popup-modal  ${direction === PopupDirection.BottomToTop ? 'popup-bt-top' : direction === PopupDirection.TopToBottom ? 'popup-top-bt' : ''}`}
                    >
                        <div className={`popup-modal__content`}>{renderPopup()}</div>
                    </m.div>
                </m.div>
            )}

            {children}
        </Provider>
    );
});

export const useModal = () => React.useContext(ModalContext);
