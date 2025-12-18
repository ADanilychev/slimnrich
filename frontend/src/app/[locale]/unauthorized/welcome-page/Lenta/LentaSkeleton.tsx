import React from 'react';
import Skeleton from 'react-loading-skeleton';

import './lenta.scss';

export const LentaSkeleton = () => {
    return (
        <div className="start-lenta">
            <Skeleton
                className="start-lenta__item"
                containerClassName="start-lenta__wrapper"
                count={5}
                style={{ background: 'var(--base-color)' }}
            />
        </div>
    );
};
