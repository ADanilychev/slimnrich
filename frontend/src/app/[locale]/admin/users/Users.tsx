import { BalanceStatisticsBadge } from '@/components/ADMIN/Badges/BalanceStatisticsBadge/BalanceStatisticsBadge';
import { ModeratorManagementBadge } from '@/components/ADMIN/Badges/ModeratorManagementBadge/ModeratorManagementBadge';
import { ReferralsManagement } from '@/components/ADMIN/Badges/ReferralsManagementBadge/ReferralsManagementBadge';
import { UsersStatisticsBadge } from '@/components/ADMIN/Badges/UsersStatisticsBadge/UsersStatisticsBadge';

import './users.scss';

export function Users() {
    return (
        <div className="admin-page admin-users-page">
            <UsersStatisticsBadge />
            <BalanceStatisticsBadge />
            <ModeratorManagementBadge />
            <ReferralsManagement />
        </div>
    );
}
