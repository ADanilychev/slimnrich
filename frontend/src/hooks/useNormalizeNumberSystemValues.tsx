import { useMemo } from 'react';

import { INumberSystem } from '@/lib/constants/NumberSystem';
import { getCmFromIn } from '@/lib/helpers/heightConvertor';
import { getKgFromPounds } from '@/lib/helpers/weightConvertor';

import { useTestStore } from '@/store/test.store';

export const useNormalizeNumberSystemValues = (weight: string, height: string) => {
    const numberSystem = useTestStore((store) => store.stepForm.numbers);

    const normalizeValues = useMemo(() => {
        let normalize_weight = Number(weight);
        let normalize_height = Number(height);

        if (numberSystem === INumberSystem.LB_IN) {
            normalize_weight = Number(getKgFromPounds(Number(weight)));
            normalize_height = Number(getCmFromIn(Number(height)));
        }

        return {
            normalize_weight,
            normalize_height,
        };
    }, [weight, height]);

    return {
        normalizeValues,
    };
};
