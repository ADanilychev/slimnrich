import { IUserProfileData } from '@/lib/types/services/admin.type';

import '../admin-badge.scss';
import './reportsOnUser.scss';

export function ReportsOnUser({ user }: { user?: IUserProfileData }) {
    return (
        <div className="admin-badge reports-on-user-badge">
            <div className="admin-badge__header">
                <p className="admin-badge__title">Reports on this users</p>
            </div>
            <div className="admin-badge__content">
                <div className="reports-on-user-badge__row">
                    <p>Reports per user:</p>
                    <b>{user?.reports_for_user}</b>
                </div>
                <div className="reports-on-user-badge__row">
                    <p>Reports written by user:</p>
                    <b>{user?.reports_by_user}</b>
                </div>
                <div className="reports-on-user-badge__row">
                    <p>User ban:</p>
                    <b>{user?.approved_reports_for_user}</b>
                </div>
            </div>
        </div>
    );
}
