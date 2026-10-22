import { nanoid } from "nanoid";
import { DayPlan, Itinerary } from "@/lib/trips/types";
import { readData, updateData } from "@/lib/data/localDb";

export function listItineraryVersions(tripId: string): Itinerary[] {
  return readData()
    .itineraries.filter((i) => i.tripId === tripId)
    .sort((a, b) => a.version - b.version);
}

export function getCurrentItinerary(tripId: string): Itinerary | null {
  return (
    readData().itineraries.find((i) => i.tripId === tripId && i.isCurrent) ?? null
  );
}

export function getItineraryVersion(tripId: string, version: number): Itinerary | null {
  return (
    readData().itineraries.find((i) => i.tripId === tripId && i.version === version) ?? null
  );
}

/** Saves a brand-new version of the itinerary and marks it current. */
export function saveNewVersion(tripId: string, days: DayPlan[]): Itinerary {
  const existing = listItineraryVersions(tripId);
  const nextVersion = (existing[existing.length - 1]?.version ?? 0) + 1;
  const itinerary: Itinerary = {
    id: nanoid(10),
    tripId,
    version: nextVersion,
    isCurrent: true,
    createdAt: new Date().toISOString(),
    days,
  };

  updateData((data) => ({
    ...data,
    itineraries: [
      ...data.itineraries.map((i) => (i.tripId === tripId ? { ...i, isCurrent: false } : i)),
      itinerary,
    ],
  }));

  return itinerary;
}

/** Marks an existing older version as current again (used by Undo / restore). */
export function restoreVersion(tripId: string, version: number): Itinerary | null {
  let restored: Itinerary | null = null;
  updateData((data) => {
    const itineraries = data.itineraries.map((i) => {
      if (i.tripId !== tripId) return i;
      const isTarget = i.version === version;
      if (isTarget) restored = i;
      return { ...i, isCurrent: isTarget };
    });
    return { ...data, itineraries };
  });
  return restored;
}

export function deleteItinerariesForTrip(tripId: string): void {
  updateData((data) => ({
    ...data,
    itineraries: data.itineraries.filter((i) => i.tripId !== tripId),
  }));
}
