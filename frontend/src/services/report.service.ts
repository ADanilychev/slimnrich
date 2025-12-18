import { IReportDataItem, TReportFilterType, TReportStatus } from '@/lib/types/services/report.type';

import { API } from '@/api';

class reportService {
    async getReportsData({
        moderation_mode,
        status,
    }: {
        moderation_mode: boolean;
        status: TReportFilterType;
    }): Promise<IReportDataItem[]> {
        return (await API.get(`/reports?moderation_mode=${moderation_mode}&status=${status}`)).data;
    }

    async reportModeration(report_id: number, status: boolean): Promise<{ result: boolean }> {
        return (await API.put(`reports?report_id=${report_id}&status=${status}`)).data;
    }
}

export const ReportService = new reportService();
