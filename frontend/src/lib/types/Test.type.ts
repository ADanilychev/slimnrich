import { HEIGHT_SYSTEM, WEIGHT_SYSTEM } from '../constants/NumberSystem';

export type genderType = ['Man', 'Woman', 'Other'];
export type IGender = 'Man' | 'Woman' | 'Other' | '';

export type ageType = ['18 ot 19', '20 s', '30 s', '40 s', '50 s', '60+'];
export type IAge = '18 ot 19' | '20 s' | '30 s' | '40 s' | '50 s' | '60+' | '';

export type numberSystemObjType = {
    name: string;
    values: [WEIGHT_SYSTEM.IB | WEIGHT_SYSTEM.KG, HEIGHT_SYSTEM.CM | HEIGHT_SYSTEM.IN];
    slug: 'kg/cm' | 'lb/in';
}[];

export type numberSystemHeightType = 'in' | 'cm';
export type numberSystemWeightType = 'ib' | 'kg';
