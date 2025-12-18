import { PropsWithChildren } from 'react';

import './chatWrapper.scss';

export function ChatWrapper({ children }: PropsWithChildren) {
    return <div className="wrapper-chat">{children}</div>;
}
