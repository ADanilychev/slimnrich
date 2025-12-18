import { ITestForm } from '@/lib/types/TestStore.type';
import { INumberSystemsItem } from '@/lib/types/services/number-system.type';
import { IRegistrationResponse } from '@/lib/types/services/regisatration.type';
import { ITimeZoneItem } from '@/lib/types/timezone.type';

import { API } from '@/api';

class registerService {
    async getQuestions(): Promise<IQuestion[]> {
        return (await API.get('/questions')).data;
    }

    async Registration(payload: ITestForm): Promise<IRegistrationResponse> {
        return (await API.post('/registration', payload)).data;
    }

    async getTimeZones(): Promise<ITimeZoneItem[]> {
        return (await API.get('/timezones')).data;
    }

    async getNumberSystems(): Promise<INumberSystemsItem[]> {
        return (await API.get('/number_systems')).data;
    }
}

export const RegisterService = new registerService();
