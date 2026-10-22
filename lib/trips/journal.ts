import { nanoid } from "nanoid";
import { JournalEntry, Mood } from "@/lib/trips/types";
import { readData, updateData } from "@/lib/data/localDb";

export function listJournalEntries(tripId: string): JournalEntry[] {
  return readData()
    .journalEntries.filter((j) => j.tripId === tripId)
    .sort((a, b) => a.dayNumber - b.dayNumber);
}

export function getJournalEntry(tripId: string, dayNumber: number): JournalEntry | null {
  return (
    readData().journalEntries.find((j) => j.tripId === tripId && j.dayNumber === dayNumber) ?? null
  );
}

export function saveJournalEntry(
  tripId: string,
  dayNumber: number,
  input: { note: string; mood: Mood | null; photoDataUrl: string | null }
): JournalEntry {
  const existing = getJournalEntry(tripId, dayNumber);
  const entry: JournalEntry = {
    id: existing?.id ?? nanoid(8),
    tripId,
    dayNumber,
    note: input.note,
    mood: input.mood,
    photoDataUrl: input.photoDataUrl,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  updateData((data) => ({
    ...data,
    journalEntries: existing
      ? data.journalEntries.map((j) => (j.id === existing.id ? entry : j))
      : [...data.journalEntries, entry],
  }));
  return entry;
}

export function deleteJournalPhoto(tripId: string, dayNumber: number): void {
  updateData((data) => ({
    ...data,
    journalEntries: data.journalEntries.map((j) =>
      j.tripId === tripId && j.dayNumber === dayNumber ? { ...j, photoDataUrl: null } : j
    ),
  }));
}
