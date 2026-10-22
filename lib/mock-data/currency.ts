import { CurrencyCode } from "@/lib/trips/types";

/** Fixed demo rates: units of currency per 1 INR, and INR per 1 unit. */
export const CURRENCY_TO_INR: Record<CurrencyCode, number> = {
  INR: 1,
  USD: 83.5,
  EUR: 90.2,
  GBP: 105.8,
  AED: 22.7,
  THB: 2.35,
};

export const CURRENCIES: CurrencyCode[] = ["INR", "USD", "EUR", "GBP", "AED", "THB"];

/** Converts `amount` of `from` currency into `to` currency using the fixed table. */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): { converted: number; rateUsed: number } {
  const amountInINR = amount * CURRENCY_TO_INR[from];
  const converted = amountInINR / CURRENCY_TO_INR[to];
  const rateUsed = CURRENCY_TO_INR[from] / CURRENCY_TO_INR[to];
  return { converted: Math.round(converted * 100) / 100, rateUsed };
}
