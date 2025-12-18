export const IN_TO_CM = 2.54;

export const getCmFromIn = (height: number) => {
    return (height * IN_TO_CM).toFixed(1);
};

export const getInFromCm = (height: number) => {
    return (height / IN_TO_CM).toFixed(1);
};
