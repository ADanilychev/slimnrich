import { FC } from 'react';

import cn from '@/lib/import/classnames';

import './tabMenu.scss';

interface ITabMenu {
    className?: string;
    activeLink: string | number;
    links: {
        link: () => void;
        text: string | number;
        slug: string | number | boolean;
        active?: boolean;
    }[];
}

const TabMenu: FC<ITabMenu> = ({ links, className, activeLink }) => {
    return (
        <div className={cn('tab-menu', className)}>
            {links.map((link) => (
                <div
                    className={cn('filter-control', {
                        active: typeof link.slug !== 'boolean' ? link.slug === activeLink : link.slug,
                    })}
                    key={link.text}
                    onClick={link.link}
                    style={{
                        display: link.active === false ? 'none' : 'inherit',
                    }}
                >
                    {link.text}
                    <span />
                </div>
            ))}
        </div>
    );
};

export default TabMenu;
