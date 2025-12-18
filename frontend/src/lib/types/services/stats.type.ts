import { INumberSystem } from '@/lib/constants/NumberSystem';

export interface IStatsData {
    result: {
        '7': IAdditionalProp;
        '30': IAdditionalProp;
        '365': IAdditionalProp;
        all: IAdditionalProp;
    };
}

interface IAdditionalProp {
    stats: number[];
    change: number;
    current: number;
    average: number;
    numbers_system: INumberSystem;
}
