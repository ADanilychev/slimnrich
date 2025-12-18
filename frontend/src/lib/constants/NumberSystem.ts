export enum WEIGHT_SYSTEM {
    IB = 'lb',
    KG = 'kg',
}

export enum HEIGHT_SYSTEM {
    IN = 'in',
    CM = 'cm',
}

export enum INumberSystem {
    LB_IN = 'lb/in',
    KG_CM = 'kg/cm',
}

export type TNumberSystem = INumberSystem.LB_IN | INumberSystem.LB_IN;
