import { API } from '@/api';

class termsService {
    private _terms = '/terms';

    async getTermsInfo(): Promise<{ result: boolean }> {
        return (await API.get(`${this._terms}/status`)).data;
    }

    async acceptTerms(): Promise<{ result: boolean }> {
        return (await API.post(`${this._terms}/accept`)).data;
    }
}

export const TermsService = new termsService();
