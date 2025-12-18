'use client';

import { default as cn } from 'classnames';
import { match } from 'path-to-regexp';
import { useMemo } from 'react';
import { LuCircleUserRound, LuMessageSquareText, LuTrophy } from 'react-icons/lu';
import Skeleton from 'react-loading-skeleton';

import { ADMIN_PAGE } from '@/lib/constants/admin.routes';

import { useCheckRole } from '@/hooks/react-queries/useCheckRole';
import { Link, usePathname } from '@/i18n/routing';

import './adminNavigationMenu.scss';

const ADMIN_NAV = [
    {
        name: 'Users',
        link: ADMIN_PAGE.USERS,
        Icon: LuCircleUserRound,
        canModerationView: false,
    },
    {
        name: 'Battles',
        link: ADMIN_PAGE.BATTLES,
        Icon: LuTrophy,
        canModerationView: false,
    },
    {
        name: 'Chat',
        link: ADMIN_PAGE.CHAT,
        Icon: LuMessageSquareText,
        canModerationView: true,
    },
];

export function AdminNavigationMenu() {
    const pathname = usePathname();

    const { data, isLoading } = useCheckRole();

    const navList = useMemo(() => {
        if (data?.result === false) return ADMIN_NAV;

        if (data?.result) return ADMIN_NAV.filter((n) => n.canModerationView);

        return [];
    }, [data]);

    if (isLoading) return <Skeleton className="admin-navigation-menu admin-navigation-menu_skeleton" height={66} />;

    return (
        <div className="admin-navigation-menu">
            {navList.map((link, index) => (
                <Link
                    href={link.link}
                    key={index}
                    className={cn('admin-navigation-menu__item', {
                        'admin-navigation-menu__item_active': match(link.link)(pathname),
                    })}
                >
                    <link.Icon size={20} />
                    {link.name}
                </Link>
            ))}
        </div>
    );
}
