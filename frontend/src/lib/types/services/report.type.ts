export interface IReportForm {
    user_id: number;
    text: string | null;
}

export type TReportFilterType = 'all' | 'ended' | 'consideration';
export type TReportStatus = 'approved' | 'declined' | 'consideration';

export interface IReportDataItem {
    id: number;
    sender: number;
    receiver: number;
    status: TReportStatus;
    text: string;
    date: number;
}
