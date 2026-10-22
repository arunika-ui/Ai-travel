import { describe, expect, it } from "vitest";
import { convertCurrency } from "@/lib/mock-data/currency";

describe("convertCurrency", () => {
  it("returns the same amount when converting INR to INR", () => {
    const { converted } = convertCurrency(1000, "INR", "INR");
    expect(converted).toBe(1000);
  });

  it("converts USD to INR using the fixed rate", () => {
    const { converted, rateUsed } = convertCurrency(10, "USD", "INR");
    expect(rateUsed).toBeCloseTo(83.5, 5);
    expect(converted).toBeCloseTo(835, 2);
  });

  it("converts INR to USD using the fixed rate", () => {
    const { converted } = convertCurrency(835, "INR", "USD");
    expect(converted).toBeCloseTo(10, 1);
  });

  it("converts between two non-INR currencies via INR", () => {
    const { converted } = convertCurrency(100, "EUR", "USD");
    expect(converted).toBeGreaterThan(0);
  });
});
