import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import { Itinerary, Trip } from "@/lib/trips/types";

export interface SharePayload {
  trip: Pick<Trip, "title" | "destination" | "startDate" | "endDate" | "travelers" | "currency">;
  itinerary: Pick<Itinerary, "days" | "version">;
}

/** Compresses the itinerary (no expenses, no memory) into a URL-safe string for a read-only link. */
export function encodeShare(trip: Trip, itinerary: Itinerary): string {
  const payload: SharePayload = {
    trip: {
      title: trip.title,
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      travelers: trip.travelers,
      currency: trip.currency,
    },
    itinerary: { days: itinerary.days, version: itinerary.version },
  };
  return compressToEncodedURIComponent(JSON.stringify(payload));
}

export function decodeShare(data: string): SharePayload | null {
  try {
    const json = decompressFromEncodedURIComponent(data);
    if (!json) return null;
    return JSON.parse(json) as SharePayload;
  } catch {
    return null;
  }
}
