import axios from 'axios';
import { getCookie } from 'cookies-next';

import { isClientSide } from '@/lib/helpers/isClientSide.helper';

export const API = axios.create({
    baseURL: 'https://webapp.slim-n-rich.ru/api/',
    withCredentials: true,
});

API.interceptors.request.use((config) => {
    if (isClientSide) config.headers['user-session'] = getCookie('user-session');

    return config;
});
