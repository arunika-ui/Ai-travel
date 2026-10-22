import { readData, updateData } from "@/lib/data/localDb";

/** BR-9: itinerary generations are capped separately from chat commands. */
export function getGenerationCountToday(userId: string): number {
  const key = `${userId}:${new Date().toISOString().slice(0, 10)}`;
  return readData().itineraryGenerationCountsByDay[key] ?? 0;
}

export function incrementGenerationCountToday(userId: string): number {
  const key = `${userId}:${new Date().toISOString().slice(0, 10)}`;
  let next = 0;
  updateData((data) => {
    next = (data.itineraryGenerationCountsByDay[key] ?? 0) + 1;
    return {
      ...data,
      itineraryGenerationCountsByDay: { ...data.itineraryGenerationCountsByDay, [key]: next },
    };
  });
  return next;
}
