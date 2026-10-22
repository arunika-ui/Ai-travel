import { nanoid } from "nanoid";
import { Trip } from "@/lib/trips/types";
import { updateData } from "@/lib/data/localDb";
import { getCurrentItinerary } from "@/lib/trips/itinerary";

/** FR-3.6: removes a trip and everything that belongs to it. */
export function deleteTrip(tripId: string): void {
  updateData((data) => ({
    ...data,
    trips: data.trips.filter((t) => t.id !== tripId),
    itineraries: data.itineraries.filter((i) => i.tripId !== tripId),
    expenses: data.expenses.filter((e) => e.tripId !== tripId),
    memories: data.memories.filter((m) => m.tripId !== tripId),
    commandLogs: data.commandLogs.filter((c) => c.tripId !== tripId),
    feedback: data.feedback.filter((f) => f.tripId !== tripId),
  }));
}

/**
 * FR-3.5: copies a trip's details and current itinerary (not its expenses
 * or memory) into a new trip owned by the same user.
 */
export function duplicateTrip(trip: Trip): Trip {
  const newTrip: Trip = {
    ...trip,
    id: nanoid(10),
    title: `${trip.title} (copy)`,
    createdAt: new Date().toISOString(),
    collaborators: [],
  };

  updateData((data) => {
    const currentItinerary = getCurrentItinerary(trip.id);
    const copiedItineraries = currentItinerary
      ? [
          {
            ...currentItinerary,
            id: nanoid(10),
            tripId: newTrip.id,
            version: 1,
            isCurrent: true,
            createdAt: new Date().toISOString(),
          },
        ]
      : [];
    return {
      ...data,
      trips: [...data.trips, newTrip],
      itineraries: [...data.itineraries, ...copiedItineraries],
    };
  });

  return newTrip;
}
