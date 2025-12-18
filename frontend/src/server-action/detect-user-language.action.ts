import { NextRequest } from 'next/server';

export const detectUserLanguage = async (request: NextRequest) => {
    const url = new URL(request.url);
    const currentLocal = url.pathname.split('/')[1] || 'ru';

    return currentLocal;
};
