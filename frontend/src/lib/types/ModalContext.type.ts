export interface IModalContext {
    isOpenPopup: boolean;
    togglePopup: (flag: boolean, popupType?: PopupTypes, payload?: any, direction?: PopupDirection) => void;
    popupType: PopupTypes | null;
}

export enum PopupTypes {
    SelectLanguageModal = 1,
    EditProfile = 2,
    RecordWeight = 3,
    NotEnoughMoney = 4,
    NotUserPremium = 5,
    SendUserReport = 6,
    UserPhotoGallery = 7,
    NewAchievement = 8,
    CancelBattle = 9,
    Ban = 10,
    BattleMotivation = 11,
    BattleCharity = 12,
    RemoveModerator = 13,
    AddModerator = 14,
    SetUserBan = 15,
    UnBanUser = 16,
    AddBlogger = 17,
    RemoveBlogger = 18,
    Empty = 19,
    PhotoFoodPopup = 20,
    PhotoLifeStylePopup = 21,
    DeleteAccount = 22,
    NotSupport = 23,
    CreateUniqueRepost = 24,
}

export enum PopupDirection {
    TopToBottom,
    BottomToTop,
    Center,
}
