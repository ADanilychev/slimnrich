import MenuNavigation from '@/components/MenuNavigation/MenuNavigation';

import './layout.scss';

export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="lk-main">
            {children}
            <MenuNavigation />
        </main>
    );
}
