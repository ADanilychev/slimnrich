import { IUserProfileData } from '@/lib/types/services/admin.type';

import '../admin-badge.scss';
import './profileStatisticsBadge.scss';

export function ProfileStatisticsBadge({ user }: { user?: IUserProfileData }) {
    return (
        <div className="admin-badge profile-statistics-badge">
            <div className="admin-badge__header">
                <p className="admin-badge__title">Profile statistics</p>
            </div>
            <div className="admin-badge__content">
                <div className="profile-statistics-badge__row">
                    <p>User IP:</p>
                    <b>{user?.approved_terms_ip}</b>
                </div>
                <div className="profile-statistics-badge__row">
                    <p>User ID:</p>
                    <b>{user?.user_id}</b>
                </div>
                <div className="profile-statistics-badge__row">
                    <p>In the app:</p>
                    <b>{user?.reg_date}</b>
                </div>
                {user?.is_premium && (
                    <div className="profile-statistics-badge__row">
                        <p>Premium:</p>
                        <b>until {user?.premium_date}</b>
                    </div>
                )}
                <div className="profile-statistics-badge__row">
                    <p>Current weight:</p>
                    <b>{user?.weight_kg} kg</b>
                </div>
                <div className="profile-statistics-badge__row">
                    <p>Weight lost:</p>
                    <b>{user?.weight_lost} kg</b>
                </div>
            </div>
        </div>
    );
}
