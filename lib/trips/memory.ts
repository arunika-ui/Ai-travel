import { nanoid } from "nanoid";
import { TripMemory } from "@/lib/trips/types";
import { readData, updateData } from "@/lib/data/localDb";

export function listMemory(tripId: string): TripMemory[] {
  return readData().memories.filter((m) => m.tripId === tripId);
}

export function rememberFact(
  tripId: string,
  key: string,
  value: string,
  source: "user" | "ai" = "ai"
): TripMemory {
  const existing = readData().memories.find((m) => m.tripId === tripId && m.key === key);
  const memory: TripMemory = {
    id: existing?.id ?? nanoid(8),
    tripId,
    key,
    value,
    source,
    updatedAt: new Date().toISOString(),
  };
  updateData((data) => ({
    ...data,
    memories: existing
      ? data.memories.map((m) => (m.id === existing.id ? memory : m))
      : [...data.memories, memory],
  }));
  return memory;
}

export function updateMemory(id: string, value: string): void {
  updateData((data) => ({
    ...data,
    memories: data.memories.map((m) =>
      m.id === id ? { ...m, value, updatedAt: new Date().toISOString() } : m
    ),
  }));
}

export function deleteMemory(id: string): void {
  updateData((data) => ({ ...data, memories: data.memories.filter((m) => m.id !== id) }));
}
