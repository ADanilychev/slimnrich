import { useTranslations } from 'next-intl';

import { IReportDataItem } from '@/lib/types/services/report.type';

import './reportItem.scss';

export function ReportItem({ report }: { report: IReportDataItem }) {
    const t = useTranslations('ReportItem');
    return (
        <div className={`report-item report-item_${report.status}`}>
            <div className="report-item__top">
                <p>{t('Reported', { number: report.id })}</p>
            </div>
            <div className="report-item__content">
                <div className="report-item__row">
                    <p>
                        {t('Status')}: <b>{t(report.status)}</b>
                    </p>
                </div>
                <div className="report-item__row">
                    <p>
                        {t('Date')}: <i>{report.date}</i>
                    </p>
                </div>
            </div>
        </div>
    );
}
