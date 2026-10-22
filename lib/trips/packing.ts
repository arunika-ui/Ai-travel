import { nanoid } from "nanoid";
import { PackingItem, Trip } from "@/lib/trips/types";
import { readData, updateData } from "@/lib/data/localDb";
import { tripLengthDays } from "@/lib/validation/schemas";

const BASICS = ["ID / passport copy", "Phone charger", "Power bank", "Basic medicines", "Reusable water bottle"];

const CLIMATE_ITEMS: Record<string, string[]> = {
  udaipur: ["Light cotton clothes", "Sunglasses", "Sunscreen", "Modest clothing for temples"],
  jaipur: ["Light cotton clothes", "Sunglasses", "Sunscreen", "Modest clothing for temples", "Comfortable walking shoes"],
  goa: ["Swimwear", "Flip-flops", "Sunscreen (high SPF)", "Light breathable clothes", "A light rain jacket"],
  manali: ["Warm jacket", "Thermal layers", "Woolen cap and gloves", "Sturdy trekking shoes", "Lip balm"],
  rishikesh: ["Comfortable activewear", "Quick-dry towel", "Sandals for the river", "Light jacket for evenings"],
};

const INTEREST_ITEMS: Record<string, string[]> = {
  heritage: ["Modest clothing for temples/forts", "A good walking shoe"],
  museum: ["A notebook for sketching/notes"],
  lake: ["A light jacket for boat rides"],
  beach: ["Swimwear", "A beach towel", "Waterproof phone pouch"],
  food: ["Antacids, just in case", "An appetite"],
  cafe: [],
  market: ["A foldable tote bag for shopping"],
  adventure: ["Comfortable sports shoes", "A change of clothes"],
  nature: ["Insect repellent", "A small backpack"],
  temple: ["A scarf or shawl for modest dress"],
  nightlife: ["A going-out outfit"],
  shopping: ["An extra foldable bag for souvenirs"],
};

/**
 * Rule-based (not AI) packing list generator, built on the trip's
 * destination climate, interests, pace and length — same "deterministic,
 * grounded" spirit as the itinerary generator.
 */
export function generatePackingList(trip: Trip): Omit<PackingItem, "id" | "tripId" | "checked">[] {
  const days = tripLengthDays(trip.startDate, trip.endDate);
  const items = new Map<string, string>(); // label -> category

  for (const item of BASICS) items.set(item, "Essentials");
  for (const item of CLIMATE_ITEMS[trip.destination] ?? []) items.set(item, "Climate");
  for (const interest of trip.interests) {
    for (const item of INTEREST_ITEMS[interest] ?? []) items.set(item, "Activities");
  }

  const outfitCount = Math.min(days, 7);
  items.set(`${outfitCount} changes of clothes`, "Essentials");
  if (trip.pace === "packed") items.set("Blister plasters", "Essentials");
  if (trip.travelers > 1) items.set("A shared first-aid kit", "Essentials");

  return Array.from(items.entries()).map(([label, category]) => ({ label, category }));
}

export function listPackingItems(tripId: string): PackingItem[] {
  return readData().packingItems.filter((p) => p.tripId === tripId);
}

export function ensurePackingList(trip: Trip): PackingItem[] {
  const existing = listPackingItems(trip.id);
  if (existing.length > 0) return existing;
  const generated = generatePackingList(trip).map((item) => ({
    ...item,
    id: nanoid(8),
    tripId: trip.id,
    checked: false,
  }));
  updateData((data) => ({ ...data, packingItems: [...data.packingItems, ...generated] }));
  return generated;
}

export function regeneratePackingList(trip: Trip): PackingItem[] {
  const generated = generatePackingList(trip).map((item) => ({
    ...item,
    id: nanoid(8),
    tripId: trip.id,
    checked: false,
  }));
  updateData((data) => ({
    ...data,
    packingItems: [...data.packingItems.filter((p) => p.tripId !== trip.id), ...generated],
  }));
  return generated;
}

export function toggleItem(id: string): void {
  updateData((data) => ({
    ...data,
    packingItems: data.packingItems.map((p) => (p.id === id ? { ...p, checked: !p.checked } : p)),
  }));
}

export function addCustomItem(tripId: string, label: string): PackingItem {
  const item: PackingItem = { id: nanoid(8), tripId, label, category: "Custom", checked: false };
  updateData((data) => ({ ...data, packingItems: [...data.packingItems, item] }));
  return item;
}

export function removeItem(id: string): void {
  updateData((data) => ({ ...data, packingItems: data.packingItems.filter((p) => p.id !== id) }));
}
