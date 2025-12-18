import { useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';

import { WEIGHT_SYSTEM } from '@/lib/constants/NumberSystem';
import { getBMI } from '@/lib/helpers/getBMI';

import { useProfile } from '../react-queries/useProfile';
import { useTransformNumberSystem } from '../useTransformNumberSystem';

export const useValidateWeightBase = () => {
    const t = useTranslations('ValidateWeightBase');
    const { data } = useProfile();

    const { getNumberSystem, transformToKg, transformToIb } = useTransformNumberSystem();

    const userWeightNumberSystem = useMemo(() => {
        return getNumberSystem(data?.numbers_system).weight;
    }, [data]);

    const validateWeightBase = useCallback(
        (value: number | null, checkBMI: boolean = true) => {
            if (!value) return false;

            const min = userWeightNumberSystem === WEIGHT_SYSTEM.IB ? Number(transformToIb(4.8)) : 4.8;
            const max = userWeightNumberSystem === WEIGHT_SYSTEM.IB ? Number(transformToIb(635)) : 635;

            if (value < min) {
                return `${t('Min')}: ${min} ${userWeightNumberSystem}`;
            }
            if (value > max) {
                return `${t('Max')}: ${max} ${userWeightNumberSystem}`;
            }

            if (checkBMI) {
                const weight = userWeightNumberSystem === WEIGHT_SYSTEM.IB ? Number(transformToKg(value)) : value;
                const height = data?.height_cm || 0;

                const bmi = getBMI(weight, height);

                if (bmi < 16) return t('Error');
            }

            return true;
        },
        [userWeightNumberSystem, data],
    );

    return { validateWeightBase };
};
