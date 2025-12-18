import '@/components/CustomBattlePageComponents/custom-battle.scss';

import './layout.scss';

export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="lk-battle">
            <div className="hidden-scroll">{children}</div>
        </main>
    );
}
