import { TNumberSystem } from '../constants/NumberSystem';

import { IGender } from './Test.type';

export interface ITestStore {
    step: number;
    setStep: (step: number) => void;
    stepForm: ITestForm;
    updateStepForm: (data: Partial<ITestForm>) => void;
}

export interface ITestForm {
    gender: IGender;
    age: string;
    numbers: TNumberSystem | null;
    timezone: number | null;
    height: string;
    weight: string;
    physical: string;
    physical_description: string;
    sport: string;
    sport_description: string;
    nutrition: string[];
    nutrition_description: string;
    body_type: string;
    body_type_description: string;
    allergies: string;
    allergies_description: string;
    chronic_diseases: string;
    chronic_diseases_description: string;
    bad_habits: string;
    bad_habits_description: string;
    motivation: string[];
    motivation_description: string;
    interests: string[];
    interests_description: string;
    family: string;
}
