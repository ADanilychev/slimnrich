import type { PropsWithChildren } from 'react';

import { AdminNavigationMenu } from '@/components/ADMIN/AdminNavigationMenu/AdminNavigationMenu';

import './layout.scss';

export default function Layout({ children }: PropsWithChildren<unknown>) {
    return (
        <div className="admin-layout">
            {children}
            <AdminNavigationMenu />
        </div>
    );
}
