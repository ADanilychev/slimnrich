import localFont from 'next/font/local';

export const ManropeFonts = localFont({
    src: [
        {
            path: './Manrope-Regular.woff2',
            weight: 'normal',
            style: 'normal',
        },
        {
            path: './Manrope-Thin.woff2',
            weight: '100',
            style: 'normal',
        },
        {
            path: './Manrope-Light.woff2',
            weight: '300',
            style: 'normal',
        },
        {
            path: './Manrope-Semibold.woff2',
            weight: '600',
            style: 'normal',
        },
        {
            path: './Manrope-ExtraBold.woff2',
            weight: '800',
            style: 'normal',
        },
        {
            path: './Manrope-Bold.woff2',
            weight: 'bold',
            style: 'normal',
        },
        {
            path: './Manrope-Medium.woff2',
            weight: '500',
            style: 'normal',
        },
    ],
});
