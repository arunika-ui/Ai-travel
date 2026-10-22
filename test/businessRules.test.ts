import { describe, expect, it } from "vitest";
import {
  findAllOverlaps,
  fitToBudget,
  computeTripStatus,
  highestDaySpend,
  budgetAlertLevel,
} from "@/lib/validation/businessRules";
import { DayPlan, Itinerary, Trip } from "@/lib/trips/types";

function activity(id: string, startTime: string, endTime: string, estCost = 100) {
  return { id, title: id, startTime, endTime, category: "food" as const, estCost, notes: "", placeId: null };
}

describe("findAllOverlaps", () => {
  it("detects overlapping activities within a day", () => {
    const day: DayPlan = {
      dayNumber: 1,
      date: "2025-01-01",
      theme: "",
      reason: "",
      activities: [activity("a", "09:00", "11:00"), activity("b", "10:00", "12:00")],
    };
    const itinerary: Itinerary = { id: "i1", tripId: "t1", version: 1, isCurrent: true, createdAt: "", days: [day] };
    expect(findAllOverlaps(itinerary)).toHaveLength(1);
  });

  it("finds no overlap for sequential activities", () => {
    const day: DayPlan = {
      dayNumber: 1,
      date: "2025-01-01",
      theme: "",
      reason: "",
      activities: [activity("a", "09:00", "11:00"), activity("b", "11:00", "12:00")],
    };
    const itinerary: Itinerary = { id: "i1", tripId: "t1", version: 1, isCurrent: true, createdAt: "", days: [day] };
    expect(findAllOverlaps(itinerary)).toHaveLength(0);
  });
});

describe("fitToBudget", () => {
  it("removes non-essential activities until within budget", () => {
    const day: DayPlan = {
      dayNumber: 1,
      date: "2025-01-01",
      theme: "",
      reason: "",
      activities: [
        { ...activity("a", "09:00", "10:00", 1000), category: "heritage" as const },
        { ...activity("b", "10:30", "11:30", 2000), category: "museum" as const },
        { ...activity("c", "12:00", "13:00", 300), category: "food" as const },
        { ...activity("d", "14:00", "15:00", 500), category: "market" as const },
      ],
    };
    const itinerary: Itinerary = { id: "i1", tripId: "t1", version: 1, isCurrent: true, createdAt: "", days: [day] };
    const fitted = fitToBudget(itinerary, 2000);
    const total = fitted.days[0].activities.reduce((s, a) => s + a.estCost, 0);
    expect(total).toBeLessThanOrEqual(2000);
  });
});

describe("computeTripStatus", () => {
  function trip(overrides: Partial<Trip>): Trip {
    return {
      id: "t1",
      title: "Trip",
      destination: "udaipur",
      startDate: "2025-01-01",
      endDate: "2025-01-03",
      travelers: 2,
      budget: 20000,
      currency: "INR",
      interests: [],
      pace: "moderate",
      status: "PLANNED",
      ownerId: "u1",
      createdAt: "",
      ...overrides,
    };
  }

  function isoDate(daysFromToday: number): string {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    return d.toISOString().slice(0, 10);
  }

  it("is PLANNED when start date is in the future", () => {
    const t = trip({ startDate: isoDate(5), endDate: isoDate(7) });
    expect(computeTripStatus(t, true)).toBe("PLANNED");
  });

  it("is ONGOING when today is within the date range", () => {
    const t = trip({ startDate: isoDate(-1), endDate: isoDate(2) });
    expect(computeTripStatus(t, true)).toBe("ONGOING");
  });

  it("is COMPLETED after the end date but before archive window", () => {
    const t = trip({ startDate: isoDate(-10), endDate: isoDate(-5) });
    expect(computeTripStatus(t, true)).toBe("COMPLETED");
  });

  it("is ARCHIVED 30+ days after the end date", () => {
    const t = trip({ startDate: isoDate(-40), endDate: isoDate(-35) });
    expect(computeTripStatus(t, true)).toBe("ARCHIVED");
  });

  it("stays DRAFT when there is no itinerary yet", () => {
    const t = trip({ status: "DRAFT", startDate: isoDate(5), endDate: isoDate(7) });
    expect(computeTripStatus(t, false)).toBe("DRAFT");
  });

  it("respects a manually set CANCELLED status", () => {
    const t = trip({ status: "CANCELLED" });
    expect(computeTripStatus(t, true)).toBe("CANCELLED");
  });
});

describe("budgetAlertLevel", () => {
  it("is none below 80%", () => {
    expect(budgetAlertLevel(7000, 10000)).toBe("none");
  });
  it("is warning at 80% or more", () => {
    expect(budgetAlertLevel(8000, 10000)).toBe("warning");
  });
  it("is over at 100% or more", () => {
    expect(budgetAlertLevel(10001, 10000)).toBe("over");
  });
});

describe("highestDaySpend", () => {
  it("returns the largest of three values", () => {
    expect(highestDaySpend(1000, 5000, 3000)).toBe(5000);
  });
  it("handles a tie by returning the tied value", () => {
    expect(highestDaySpend(7000, 7000, 2000)).toBe(7000);
  });
  it("handles all equal values", () => {
    expect(highestDaySpend(100, 100, 100)).toBe(100);
  });
});
