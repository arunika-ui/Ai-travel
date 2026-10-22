import { describe, expect, it } from "vitest";
import { tripInputSchema, tripLengthDays } from "@/lib/validation/schemas";

function isoDate(daysFromToday: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

function baseInput(overrides: Partial<Parameters<typeof tripInputSchema.safeParse>[0]> = {}) {
  return {
    title: "Test trip",
    destination: "udaipur",
    startDate: isoDate(5),
    endDate: isoDate(6),
    travelers: 2,
    budget: 20000,
    interests: ["heritage"],
    pace: "moderate",
    ...overrides,
  };
}

describe("tripInputSchema - trip length boundaries", () => {
  // length L means the trip spans L days inclusive (tripLengthDays == L).
  const cases: [number, boolean][] = [
    [0, false], // only reachable via end-before-start, which is itself invalid
    [1, true],
    [2, true],
    [15, true],
    [29, true],
    [30, true],
    [31, false],
  ];

  for (const [length, expected] of cases) {
    it(`trip length ${length} => ${expected ? "valid" : "invalid"}`, () => {
      const startDate = isoDate(5);
      const endDate = isoDate(5 + length - 1);
      expect(tripLengthDays(startDate, endDate)).toBe(length);
      const result = tripInputSchema.safeParse(baseInput({ startDate, endDate }));
      expect(result.success).toBe(expected);
    });
  }
});

describe("tripInputSchema - travelers boundaries", () => {
  const cases: [number, boolean][] = [
    [0, false],
    [1, true],
    [2, true],
    [5, true],
    [9, true],
    [10, true],
    [11, false],
  ];
  for (const [travelers, expected] of cases) {
    it(`travelers=${travelers} => ${expected ? "valid" : "invalid"}`, () => {
      const result = tripInputSchema.safeParse(baseInput({ travelers }));
      expect(result.success).toBe(expected);
    });
  }
});

describe("tripInputSchema - budget boundaries", () => {
  const cases: [number, boolean][] = [
    [999, false],
    [1000, true],
    [1001, true],
    [499999, true],
    [500000, true],
    [500001, false],
  ];
  for (const [budget, expected] of cases) {
    it(`budget=${budget} => ${expected ? "valid" : "invalid"}`, () => {
      const result = tripInputSchema.safeParse(baseInput({ budget }));
      expect(result.success).toBe(expected);
    });
  }
});

describe("tripInputSchema - dates", () => {
  it("rejects a start date in the past", () => {
    const result = tripInputSchema.safeParse(baseInput({ startDate: isoDate(-1), endDate: isoDate(1) }));
    expect(result.success).toBe(false);
  });

  it("rejects an end date before the start date", () => {
    const result = tripInputSchema.safeParse(baseInput({ startDate: isoDate(5), endDate: isoDate(4) }));
    expect(result.success).toBe(false);
  });
});
