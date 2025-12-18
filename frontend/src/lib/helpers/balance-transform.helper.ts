export const transformBalance = (balance: number): string => {
    if (!balance) return '0';

    if (balance < 1000) return balance.toString();

    const balanceString = balance.toString();

    return balanceString.slice(0, balanceString.length - 2) + 'K';
};
