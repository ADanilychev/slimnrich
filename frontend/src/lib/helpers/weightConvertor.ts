export const POUNDS_TO_KG = 0.45359237;

export const getKgFromPounds = (weight: number) => {
    return (weight * POUNDS_TO_KG).toFixed(1);
};

export const getPoundsFromKg = (weight: number) => {
    return (weight / POUNDS_TO_KG).toFixed(1);
};
