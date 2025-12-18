import { useEffect, useState } from 'react';

export const useDebounceReadAlerts = (alertIds: number[], delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(alertIds);

    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedValue(alertIds);
        }, delay);
        return () => {
            clearTimeout(t);
        };
    }, [alertIds, delay]);

    return debouncedValue;
};
