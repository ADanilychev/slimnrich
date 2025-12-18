import { useCallback, useMemo } from 'react';

import { HEIGHT_SYSTEM, INumberSystem, WEIGHT_SYSTEM } from '@/lib/constants/NumberSystem';
import { getCmFromIn, getInFromCm } from '@/lib/helpers/heightConvertor';
import { getKgFromPounds, getPoundsFromKg } from '@/lib/helpers/weightConvertor';

import { useProfile } from './react-queries/useProfile';

export const useTransformNumberSystem = () => {
    const { data: profileData } = useProfile();

    const transformToKg = useCallback((weight: number) => {
        return getKgFromPounds(weight);
    }, []);

    const transformToIb = useCallback((weight: number) => {
        return getPoundsFromKg(weight);
    }, []);

    const transformToCm = useCallback((height: number) => {
        return getCmFromIn(height);
    }, []);

    const transformToIn = useCallback((height: number) => {
        return getInFromCm(height);
    }, []);

    const getNumberSystem = useCallback((ns: INumberSystem | undefined): { weight: string; height: string } => {
        if (!ns) return { weight: '', height: '' };

        const [weight, height] = ns.split('/');

        return {
            weight,
            height,
        };
    }, []);

    const currentNumberSystem = useMemo(() => {
        return getNumberSystem(profileData?.numbers_system);
    }, [profileData]);

    const transformValueWithNumberSystem = useCallback(
        (value: number = 0, transformTo: 'weight' | 'height'): string => {
            if (transformTo === 'weight' && currentNumberSystem.weight === WEIGHT_SYSTEM.IB) {
                return getPoundsFromKg(value) + currentNumberSystem.weight;
            } else if (transformTo === 'weight' && currentNumberSystem.weight === WEIGHT_SYSTEM.KG)
                return value.toFixed(1) + currentNumberSystem.weight;

            if (transformTo === 'height' && currentNumberSystem.height === HEIGHT_SYSTEM.IN) {
                return getInFromCm(value) + currentNumberSystem.height;
            } else if (transformTo === 'height' && currentNumberSystem.weight === HEIGHT_SYSTEM.CM)
                return value.toFixed(1) + currentNumberSystem.weight;

            return '';
        },
        [currentNumberSystem],
    );

    return {
        transformToKg,
        transformToIb,
        transformToCm,
        transformToIn,
        getNumberSystem,
        transformValueWithNumberSystem,
        currentNumberSystem,
    };
};
