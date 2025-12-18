import { isProduction } from '../helpers/isProduction.helper';

export const BASE_API_URL = isProduction
    ? 'https://webapp.slim-n-rich.com/api'
    : 'https://solidly-relaxed-anchovy.cloudpub.ru:443/api';
