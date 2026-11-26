export const CURRENCIES = ['EUR', 'USD', 'GBP'] as const;
export type Currency = (typeof CURRENCIES)[number];

export interface ExchangeRates {
  USD: number;
  GBP: number;
}

export interface QuoteInput {
  activeUsers: number;
  country: string;
  currency: Currency;
  rates: ExchangeRates;
}

export interface QuoteResult {
  baseEur: number;
  totalEur: number;
  rate: number;
  currency: Currency;
  amount: number;
}

export function isSpain(country: string): boolean {
  const normalized = country.trim().toLowerCase();
  return normalized === 'españa' || normalized === 'spain' || normalized === 'espana';
}

export function vatRate(country: string): number {
  return isSpain(country) ? 0.21 : 0;
}

/**
 * Cumulative tiers:
 * 1-10 users at 10 EUR, 11-50 at 8 EUR, above 50 at 5 EUR.
 * 15 users => 10*10 + 5*8 = 140.
 */
export function tieredBaseCost(activeUsers: number): number {
  if (!Number.isInteger(activeUsers) || activeUsers < 0) {
    throw new Error('activeUsers must be an integer >= 0');
  }

  let remaining = activeUsers;
  let cost = 0;

  if (remaining > 50) {
    cost += (remaining - 50) * 5;
    remaining = 50;
  }
  if (remaining > 10) {
    cost += (remaining - 10) * 8;
    remaining = 10;
  }
  if (remaining > 0) {
    cost += remaining * 10;
  }

  return cost;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Price in the selected currency. The caller supplies the rate; the client amount is not an input. */
export function quote(input: QuoteInput): QuoteResult {
  const baseEur = tieredBaseCost(input.activeUsers);
  const totalEur = roundMoney(baseEur * (1 + vatRate(input.country)));
  const rate = input.currency === 'EUR' ? 1 : input.rates[input.currency];

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error('Missing exchange rate');
  }

  return {
    baseEur,
    totalEur,
    rate,
    currency: input.currency,
    amount: roundMoney(totalEur * rate),
  };
}
