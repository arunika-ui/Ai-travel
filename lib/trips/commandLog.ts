import { nanoid } from "nanoid";
import { AICommandLog, AICommandStatus } from "@/lib/trips/types";
import { readData, updateData } from "@/lib/data/localDb";

export function listCommandLog(tripId: string): AICommandLog[] {
  return readData()
    .commandLogs.filter((c) => c.tripId === tripId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function logCommand(
  tripId: string,
  text: string,
  toolsUsed: string[],
  status: AICommandStatus,
  reply: string
): AICommandLog {
  const entry: AICommandLog = {
    id: nanoid(8),
    tripId,
    text,
    toolsUsed,
    status,
    reply,
    createdAt: new Date().toISOString(),
  };
  updateData((data) => ({ ...data, commandLogs: [...data.commandLogs, entry] }));
  return entry;
}

export function setCommandFeedback(id: string, feedback: "up" | "down"): void {
  updateData((data) => ({
    ...data,
    commandLogs: data.commandLogs.map((c) => (c.id === id ? { ...c, feedback } : c)),
  }));
}

/** Daily AI command limit tracking, keyed by user + date. */
export function getCommandCountToday(userId: string): number {
  const key = `${userId}:${new Date().toISOString().slice(0, 10)}`;
  return readData().aiCommandCountsByDay[key] ?? 0;
}

export function incrementCommandCountToday(userId: string): number {
  const key = `${userId}:${new Date().toISOString().slice(0, 10)}`;
  let next = 0;
  updateData((data) => {
    next = (data.aiCommandCountsByDay[key] ?? 0) + 1;
    return {
      ...data,
      aiCommandCountsByDay: { ...data.aiCommandCountsByDay, [key]: next },
    };
  });
  return next;
}
