import { Activity, DayPlan, Itinerary, Trip, TripStatus } from "@/lib/trips/types";

export interface OverlapIssue {
  dayNumber: number;
  a: Activity;
  b: Activity;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** Finds any activities within a day whose time ranges overlap. */
export function findOverlaps(day: DayPlan): OverlapIssue[] {
  const issues: OverlapIssue[] = [];
  const sorted = [...day.activities].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (timeToMinutes(a.endTime) > timeToMinutes(b.startTime)) {
      issues.push({ dayNumber: day.dayNumber, a, b });
    }
  }
  return issues;
}

export function findAllOverlaps(itinerary: Itinerary): OverlapIssue[] {
  return itinerary.days.flatMap(findOverlaps);
}

export function dayTotalCost(day: DayPlan): number {
  return day.activities.reduce((sum, a) => sum + a.estCost, 0);
}

export function itineraryTotalCost(itinerary: Itinerary): number {
  return itinerary.days.reduce((sum, d) => sum + dayTotalCost(d), 0);
}

export function isOverBudget(itinerary: Itinerary, budget: number): boolean {
  return itineraryTotalCost(itinerary) > budget;
}

/**
 * Attempts to fit the itinerary within budget by dropping the costliest
 * non-essential (non meal/hotel/transport) activities one at a time,
 * cheapest-impact-first, until the total is within budget or nothing
 * more can be removed. Mutates nothing; returns a new itinerary.
 */
export function fitToBudget(itinerary: Itinerary, budget: number): Itinerary {
  const PROTECTED = new Set(["food", "transport"]);
  let days = itinerary.days.map((d) => ({ ...d, activities: [...d.activities] }));

  const isRemovable = (a: Activity) => !PROTECTED.has(a.category);

  while (
    days.reduce((sum, d) => sum + d.activities.reduce((s, a) => s + a.estCost, 0), 0) > budget
  ) {
    let maxCost = -1;
    let targetDayIdx = -1;
    let targetActIdx = -1;

    days.forEach((day, dIdx) => {
      day.activities.forEach((act, aIdx) => {
        if (isRemovable(act) && act.estCost > maxCost && day.activities.length > 3) {
          maxCost = act.estCost;
          targetDayIdx = dIdx;
          targetActIdx = aIdx;
        }
      });
    });

    if (targetDayIdx === -1) break;
    days[targetDayIdx].activities.splice(targetActIdx, 1);
  }

  return { ...itinerary, days };
}

/**
 * Works out the trip status automatically from today's date, honouring
 * a manually set CANCELLED/ARCHIVED/DRAFT/GENERATING/FAILED state (those
 * are not date-derived) and otherwise deriving PLANNED/ONGOING/COMPLETED/
 * ARCHIVED from the trip's date range.
 */
export function computeTripStatus(trip: Trip, hasItinerary: boolean): TripStatus {
  if (trip.status === "CANCELLED" || trip.status === "FAILED" || trip.status === "GENERATING") {
    return trip.status;
  }
  if (trip.status === "DRAFT" && !hasItinerary) {
    return "DRAFT";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const archiveDate = new Date(end);
  archiveDate.setDate(archiveDate.getDate() + 30);

  if (today < start) return "PLANNED";
  if (today >= start && today <= end) return "ONGOING";
  if (today > end && today < archiveDate) return "COMPLETED";
  return "ARCHIVED";
}

export function canCancel(trip: Trip): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(trip.startDate);
  return (trip.status === "DRAFT" || trip.status === "PLANNED") && today < start;
}

export function isReadOnly(status: TripStatus): boolean {
  return status === "ARCHIVED" || status === "COMPLETED" || status === "CANCELLED";
}

export function budgetAlertLevel(spent: number, budget: number): "none" | "warning" | "over" {
  if (budget <= 0) return "none";
  const pct = spent / budget;
  if (pct >= 1) return "over";
  if (pct >= 0.8) return "warning";
  return "none";
}

/** Returns the day (1, 2 or 3 index) with the highest spend; first day wins ties. */
export function highestDaySpend(day1: number, day2: number, day3: number): number {
  return Math.max(day1, day2, day3);
}
