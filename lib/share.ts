import { Trip } from "@/lib/types";

/**
 * Encodes a trip (sans chat history) into a URL-safe base64 blob so a
 * read-only link can open it without any login or server lookup.
 */
export function encodeTripForShare(trip: Trip): string {
  const payload = {
    id: trip.id,
    input: trip.input,
    versions: trip.versions,
    currentVersion: trip.currentVersion,
    expenses: trip.expenses,
    createdAt: trip.createdAt,
    updatedAt: trip.updatedAt,
  };
  const json = JSON.stringify(payload);
  const base64 =
    typeof window === "undefined"
      ? Buffer.from(json, "utf-8").toString("base64")
      : window.btoa(unescape(encodeURIComponent(json)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeTripFromShare(code: string): Omit<Trip, "shareCode" | "chat"> | null {
  try {
    const base64 = code.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "===".slice((base64.length + 3) % 4);
    const json =
      typeof window === "undefined"
        ? Buffer.from(padded, "base64").toString("utf-8")
        : decodeURIComponent(escape(window.atob(padded)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}
