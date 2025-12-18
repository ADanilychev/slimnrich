export enum PREMIUM_TYPES {
    BASIC = 'basic-plan',
    PREMIUM = 'premium-plan',
}

export const PREMIUM_PLANS = [
    {
        name: 'Basic plan',
        type: PREMIUM_TYPES.BASIC,
        options: {
            modes: 2,
            diploma: 2,
            editProfile: 5,
            isPremiumChat: false,
        },
        price: {
            month: 0,
            year: 0,
        },
    },
    {
        name: 'Premium plan',
        type: PREMIUM_TYPES.PREMIUM,
        options: {
            modes: 6,
            diploma: 'Free',
            editProfile: 'Free',
            isPremiumChat: true,
        },
        price: {
            month: 1000,
            year: 10000,
        },
    },
];
