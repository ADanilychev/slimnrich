import Button from '@/components/UI/Button/Button';

import { useModal } from '@/context/useModalContext';

import { ADMIN_PAGE } from '@/lib/constants/admin.routes';
import { PopupTypes } from '@/lib/types/ModalContext.type';
import { IReportDataItem } from '@/lib/types/services/report.type';

import { useRouter } from '@/i18n/routing';

import './adminReportItem.scss';

export function AdminReportItem({ report }: { report: IReportDataItem }) {
    const router = useRouter();
    const { togglePopup } = useModal();

    return (
        <div className={`admin-report-item admin-report-item_${report.status}`}>
            <div className="admin-report-item__top">
                <p>Reported №{report.id}</p>
            </div>
            <div className="admin-report-item__content">
                <div className="admin-report-item__row">
                    <p>
                        Status: <b>{report.status.toUpperCase()}</b>
                    </p>
                </div>
                <div className="admin-report-item__row">
                    <p>
                        Date of access: <i>{report.date}</i>
                    </p>
                </div>
                <div className="admin-report-item__row">
                    <p>
                        User text: <i>{report.text}</i>
                    </p>
                </div>
            </div>

            <div className="admin-report-item__buttons">
                {report.status === 'consideration' && (
                    <Button
                        variant="blue"
                        onClick={() =>
                            togglePopup(true, PopupTypes.SetUserBan, {
                                violator_id: report.receiver,
                                useModeration: true,
                                report_id: report.id,
                            })
                        }
                    >
                        Moderate report
                    </Button>
                )}

                <Button variant="stroke" onClick={() => router.push(ADMIN_PAGE.USER_ADMIN(report.receiver))}>
                    Go to user profile
                </Button>
            </div>
        </div>
    );
}
