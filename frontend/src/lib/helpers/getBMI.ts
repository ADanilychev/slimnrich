/**
 * Вычисление ИМТ, параметры должны быть переданы в КГ и СМ
 * @param weight
 * @param height
 * @returns
 */
export const getBMI = (weight: number, height: number) => {
    height = height / 100;
    return Number((weight / (height * height)).toFixed(2));
};
