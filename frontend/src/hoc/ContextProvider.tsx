import { FC, PropsWithChildren } from 'react';
import { _ModalContextProvider } from '@/context/useModalContext';
import { SkeletonTheme } from 'react-loading-skeleton';

interface IContextProvider extends PropsWithChildren {}

const ContextProvider: FC<IContextProvider> = ({ children }) => {
    return (
        <SkeletonTheme baseColor="#ebebff" highlightColor="#7200e528" duration={2}>
            <_ModalContextProvider>{children}</_ModalContextProvider>
        </SkeletonTheme>
    );
};

export default ContextProvider;
