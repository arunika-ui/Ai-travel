import { Trip, TripStatus } from "@/lib/trips/types";
import { computeTripStatus } from "@/lib/validation/businessRules";
import { getCurrentItinerary } from "@/lib/trips/itinerary";

/** Computes a trip's effective status from today's date, syncing stored status if it changed. */
export function getEffectiveStatus(trip: Trip): TripStatus {
  const hasItinerary = getCurrentItinerary(trip.id) !== null;
  return computeTripStatus(trip, hasItinerary);
}

export const STATUS_LABELS: Record<TripStatus, string> = {
  DRAFT: "Draft",
  GENERATING: "Generating",
  FAILED: "Failed",
  PLANNED: "Upcoming",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
  CANCELLED: "Cancelled",
};

export const STATUS_COLORS: Record<TripStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  GENERATING: "bg-blue-100 text-blue-700",
  FAILED: "bg-red-100 text-red-700",
  PLANNED: "bg-amber-100 text-amber-800",
  ONGOING: "bg-green-100 text-green-800",
  COMPLETED: "bg-slate-200 text-slate-700",
  ARCHIVED: "bg-slate-100 text-slate-500",
  CANCELLED: "bg-red-100 text-red-700",
};
