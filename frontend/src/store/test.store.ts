import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { ITestStore } from '@/lib/types/TestStore.type';

export const useTestStore = create<ITestStore>()(
    devtools((set, get) => ({
        step: 1,
        setStep: (step: number) => set({ step }),
        stepForm: {
            gender: '',
            age: '',
            numbers: null,
            timezone: null,
            height: '',
            weight: '',
            physical: '',
            physical_description: '',
            sport: '',
            sport_description: '',
            nutrition: [],
            nutrition_description: '',
            body_type: '',
            body_type_description: '',
            allergies: '',
            allergies_description: '',
            chronic_diseases: '',
            chronic_diseases_description: '',
            bad_habits: '',
            bad_habits_description: '',
            motivation: [],
            motivation_description: '',
            interests: [],
            interests_description: '',
            family: '',
        },
        updateStepForm: (payload) => {
            const form = get().stepForm;

            set({
                stepForm: {
                    ...form,
                    ...payload,
                },
            });
        },
    })),
);
