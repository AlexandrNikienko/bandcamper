import { Costs } from "../types/sales";

export const EMPTY_COSTS: Costs = { tracks: 0, art: 0, mastering: 0, others: 0, physical: 0, physicalProfit: 0 };

export const calcReleaseProfit = (totalRevenue: number, costs: Costs) => {
    const totalReleaseCosts = costs.tracks + costs.art + costs.mastering + costs.others + costs.physical;
    const profit = Number(totalRevenue || 0) - totalReleaseCosts + Number(costs.physicalProfit || 0);
    return { totalReleaseCosts, profit };
};

export const formatMoney = (value: number, symbol: string) =>
    `${symbol}${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const currencySymbolFor = (currency?: string) => {
    if (!currency) return '€';

    const c = String(currency).trim().toUpperCase();
    
    switch (c) {
        case 'EUR':
        case '€':
            return '€';
        case 'USD':
        case 'US$':
        case '$':
            return '$';
        case 'GBP':
        case '£':
            return '£';
        case 'JPY':
        case '¥':
            return '¥';
        default:
            return c; // fallback to currency code
    }
};
