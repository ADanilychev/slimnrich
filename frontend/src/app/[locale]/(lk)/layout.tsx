import Header from '@/components/Header/Header';

import './layout.scss';

export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="lk">
            <Header />
            <div className="hidden-scroll">{children}</div>
        </div>
    );
}
