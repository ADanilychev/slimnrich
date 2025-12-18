import { INumberSystem } from '@/lib/constants/NumberSystem';

export type TCharity = 'cats' | 'dogs' | 'children' | 'developers';

export const CHARITY_LIST = {
    CATS: 'cats',
    DOGS: 'dogs',
    CHILDREN: 'children',
    DEVELOPERS: 'developers',
};

export interface IUserSettingsPayload {
    numbers?: INumberSystem;
    timezone?: number;
    language?: string;
    notifications?: boolean;
    charity?: string;
}
