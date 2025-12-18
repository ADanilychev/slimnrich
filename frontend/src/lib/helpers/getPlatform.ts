import { isClientSide } from './isClientSide.helper';

export function getPlatform(): 'iOS' | 'Android' | 'Web' {
    if (!isClientSide) return 'Web';

    const userAgent = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';
    if (/Android/i.test(userAgent)) return 'Android';
    return 'Web';
}
