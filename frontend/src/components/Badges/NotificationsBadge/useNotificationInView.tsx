import { useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';

import { INotificationItem } from '@/lib/types/services/notification.type';

export const useNotificationInView = (
    entity: INotificationItem,
    onViewPortAction: (entity: INotificationItem) => void,
) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (isInView) {
            onViewPortAction(entity);
        }
    }, [isInView]);

    return {
        ref,
    };
};
