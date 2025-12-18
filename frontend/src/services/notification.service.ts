import { INotificationResponse, NOTIFICATION_TABS, TNotificationGroup } from '@/lib/types/services/notification.type';

import { API } from '@/api';

class notificationService {
    async getNotifications(group: NOTIFICATION_TABS, page: number): Promise<INotificationResponse> {
        return (await API.get(`/alerts?group=${group}&page=${page}`)).data;
    }

    async readNotifications(data: { alert_ids: number[]; all_condition: boolean }): Promise<{ result: true }> {
        return (await API.post('/alerts', data)).data;
    }
}

export const NotificationService = new notificationService();
