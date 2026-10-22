import {
  AICommandLog,
  AppSettings,
  Expense,
  Feedback,
  Itinerary,
  Trip,
  TripMemory,
  User,
} from "@/lib/trips/types";
import { DEFAULT_APP_SETTINGS, DEMO_USERS } from "@/lib/mock-data/users";
import { buildSeedData } from "@/lib/mock-data/seedTrips";

export interface AppData {
  trips: Trip[];
  itineraries: Itinerary[];
  expenses: Expense[];
  memories: TripMemory[];
  commandLogs: AICommandLog[];
  feedback: Feedback[];
  users: User[];
  settings: AppSettings;
  sessionUserId: string | null;
  aiCommandCountsByDay: Record<string, number>; // "userId:yyyy-mm-dd" -> count
}

const STORAGE_KEY = "ai-travel-companion:data:v1";

function buildFreshData(): AppData {
  const seed = buildSeedData("user-riya");
  return {
    trips: seed.trips,
    itineraries: seed.itineraries,
    expenses: seed.expenses,
    memories: seed.memories,
    commandLogs: seed.commandLogs,
    feedback: [],
    users: DEMO_USERS.map((u) => ({ ...u })),
    settings: { ...DEFAULT_APP_SETTINGS },
    sessionUserId: null,
    aiCommandCountsByDay: {},
  };
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function readData(): AppData {
  if (!isBrowser()) return buildFreshData();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = buildFreshData();
      writeData(fresh);
      return fresh;
    }
    const parsed = JSON.parse(raw) as AppData;
    // Defensive defaults in case of a stale shape from an older demo run.
    return {
      trips: parsed.trips ?? [],
      itineraries: parsed.itineraries ?? [],
      expenses: parsed.expenses ?? [],
      memories: parsed.memories ?? [],
      commandLogs: parsed.commandLogs ?? [],
      feedback: parsed.feedback ?? [],
      users: parsed.users?.length ? parsed.users : DEMO_USERS.map((u) => ({ ...u })),
      settings: parsed.settings ?? { ...DEFAULT_APP_SETTINGS },
      sessionUserId: parsed.sessionUserId ?? null,
      aiCommandCountsByDay: parsed.aiCommandCountsByDay ?? {},
    };
  } catch {
    return buildFreshData();
  }
}

export function writeData(data: AppData): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function updateData(mutator: (data: AppData) => AppData): AppData {
  const current = readData();
  const next = mutator(current);
  writeData(next);
  return next;
}

/** Restores all demo data (trips, itineraries, expenses, memory, logs) and keeps the current session. */
export function resetDemoData(): AppData {
  const current = readData();
  const fresh = buildFreshData();
  fresh.sessionUserId = current.sessionUserId;
  writeData(fresh);
  return fresh;
}
