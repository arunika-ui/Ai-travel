import { Trip } from "@/lib/trips/types";
import { readData, updateData } from "@/lib/data/localDb";

/**
 * Storage-agnostic contract for trip persistence. The localStorage
 * implementation below can be swapped for a real backend (e.g.
 * Supabase) later without touching any calling code.
 */
export interface TripRepository {
  list(): Promise<Trip[]>;
  listByOwner(ownerId: string): Promise<Trip[]>;
  get(id: string): Promise<Trip | null>;
  save(trip: Trip): Promise<void>;
  remove(id: string): Promise<void>;
}

export class LocalStorageTripRepository implements TripRepository {
  async list(): Promise<Trip[]> {
    return readData().trips;
  }

  async listByOwner(ownerId: string): Promise<Trip[]> {
    return readData().trips.filter((t) => t.ownerId === ownerId);
  }

  async get(id: string): Promise<Trip | null> {
    return readData().trips.find((t) => t.id === id) ?? null;
  }

  async save(trip: Trip): Promise<void> {
    updateData((data) => {
      const idx = data.trips.findIndex((t) => t.id === trip.id);
      const trips = [...data.trips];
      if (idx >= 0) trips[idx] = trip;
      else trips.push(trip);
      return { ...data, trips };
    });
  }

  async remove(id: string): Promise<void> {
    updateData((data) => ({ ...data, trips: data.trips.filter((t) => t.id !== id) }));
  }
}

export const tripRepository: TripRepository = new LocalStorageTripRepository();
