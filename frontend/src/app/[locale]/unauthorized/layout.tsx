import React from 'react';

import './layout.scss';

const layout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return <div className="unauthorized">{children}</div>;
};

export default layout;
