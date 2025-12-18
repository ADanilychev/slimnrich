import { isAxiosError } from 'axios';

import { IApiError } from '../types/services/api.type';

export const ApiErrorHandler = async (error: any, defaultMessage = 'API error') => {
    let msg = defaultMessage;
    console.log(error);
    const { toast } = await import('react-hot-toast');

    if (isAxiosError(error)) {
        const detail = (error.response?.data as IApiError)?.detail;
        if (typeof detail === 'string') {
            msg = detail;
        }
    }
    toast.error(msg);
};
