export function tokensToDollars(tokens: number, pricePer1k = 0.00015): number {
    if (!Number.isFinite(tokens) || tokens < 0) return 0;
    return (tokens / 1000) * pricePer1k;
}