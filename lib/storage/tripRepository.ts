import { Trip } from "@/lib/types";

/**
 * Storage-agnostic contract for trip persistence. The localStorage
 * implementation below can be swapped for a Supabase-backed one later
 * without touching any calling code.
 */
export interface TripRepository {
  list(): Promise<Trip[]>;
  get(id: string): Promise<Trip | null>;
  getByShareCode(code: string): Promise<Trip | null>;
  save(trip: Trip): Promise<void>;
  remove(id: string): Promise<void>;
}

const STORAGE_KEY = "ai-travel-companion:trips:v1";

function readAll(): Trip[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(trips: Trip[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

export class LocalStorageTripRepository implements TripRepository {
  async list(): Promise<Trip[]> {
    return readAll().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }

  async get(id: string): Promise<Trip | null> {
    return readAll().find((t) => t.id === id) ?? null;
  }

  async getByShareCode(code: string): Promise<Trip | null> {
    return readAll().find((t) => t.shareCode === code) ?? null;
  }

  async save(trip: Trip): Promise<void> {
    const trips = readAll();
    const idx = trips.findIndex((t) => t.id === trip.id);
    if (idx >= 0) {
      trips[idx] = trip;
    } else {
      trips.push(trip);
    }
    writeAll(trips);
  }

  async remove(id: string): Promise<void> {
    writeAll(readAll().filter((t) => t.id !== id));
  }
}

export const tripRepository: TripRepository = new LocalStorageTripRepository();
