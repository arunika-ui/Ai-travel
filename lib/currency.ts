const rateCache = new Map<string, { rate: number; fetchedAt: number }>();
const CACHE_TTL_MS = 1000 * 60 * 30;

/**
 * Converts an amount in `from` currency to INR using frankfurter.app
 * (no API key required). Falls back to 1:1 if the API is unreachable
 * or the currency is already INR.
 */
export async function convertToINR(amount: number, from: string): Promise<number> {
  const currency = from.toUpperCase();
  if (currency === "INR") return amount;

  const cached = rateCache.get(currency);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return Math.round(amount * cached.rate * 100) / 100;
  }

  try {
    const res = await fetch(
      `https://api.frankfurter.app/latest?from=${encodeURIComponent(currency)}&to=INR`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error(`frankfurter ${res.status}`);
    const data = await res.json();
    const rate = data?.rates?.INR;
    if (typeof rate !== "number") throw new Error("missing rate");
    rateCache.set(currency, { rate, fetchedAt: Date.now() });
    return Math.round(amount * rate * 100) / 100;
  } catch {
    return amount;
  }
}

export const COMMON_CURRENCIES = [
  "INR",
  "USD",
  "EUR",
  "GBP",
  "AED",
  "SGD",
  "THB",
  "AUD",
  "JPY",
  "CAD",
];
