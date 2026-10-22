import { nanoid } from "nanoid";
import { PlaceReport } from "@/lib/trips/types";
import { readData, updateData } from "@/lib/data/localDb";

/** FR-10.3: lets a traveler flag a place as having wrong information. */
export function reportPlace(tripId: string, placeId: string, placeName: string, note: string): void {
  const report: PlaceReport = { id: nanoid(8), tripId, placeId, placeName, note, createdAt: new Date().toISOString() };
  updateData((data) => ({ ...data, placeReports: [...data.placeReports, report] }));
}

export function listPlaceReports(): PlaceReport[] {
  return readData().placeReports.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
