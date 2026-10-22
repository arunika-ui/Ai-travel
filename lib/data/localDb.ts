import {
  AdminAuditEntry,
  AICommandLog,
  AppSettings,
  Expense,
  Feedback,
  Itinerary,
  JournalEntry,
  PackingItem,
  PlaceReport,
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
  itineraryGenerationCountsByDay: Record<string, number>; // "userId:yyyy-mm-dd" -> count
  placeReports: PlaceReport[];
  adminAuditLog: AdminAuditEntry[];
  loginAttempts: Record<string, { count: number; lockedUntil: string | null }>; // keyed by email
  journalEntries: JournalEntry[];
  packingItems: PackingItem[];
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
    journalEntries: seed.journalEntries,
    feedback: [],
    users: DEMO_USERS.map((u) => ({ ...u })),
    settings: { ...DEFAULT_APP_SETTINGS },
    sessionUserId: null,
    aiCommandCountsByDay: {},
    itineraryGenerationCountsByDay: {},
    placeReports: [],
    adminAuditLog: [],
    loginAttempts: {},
    packingItems: [],
  };
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function withPreferenceDefaults(user: User): User {
  return {
    ...user,
    preferences: {
      ...user.preferences,
      dietaryNeeds: user.preferences?.dietaryNeeds ?? "",
    },
  };
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
    const parsed = JSON.parse(raw) as Partial<AppData>;
    // Defensive defaults in case of a stale shape from an older demo run.
    return {
      trips: parsed.trips ?? [],
      itineraries: parsed.itineraries ?? [],
      expenses: parsed.expenses ?? [],
      memories: parsed.memories ?? [],
      commandLogs: parsed.commandLogs ?? [],
      feedback: parsed.feedback ?? [],
      users: parsed.users?.length
        ? parsed.users.map(withPreferenceDefaults)
        : DEMO_USERS.map((u) => ({ ...u })),
      settings: { ...DEFAULT_APP_SETTINGS, ...parsed.settings },
      sessionUserId: parsed.sessionUserId ?? null,
      aiCommandCountsByDay: parsed.aiCommandCountsByDay ?? {},
      itineraryGenerationCountsByDay: parsed.itineraryGenerationCountsByDay ?? {},
      placeReports: parsed.placeReports ?? [],
      adminAuditLog: parsed.adminAuditLog ?? [],
      loginAttempts: parsed.loginAttempts ?? {},
      journalEntries: parsed.journalEntries ?? [],
      packingItems: parsed.packingItems ?? [],
    };
  } catch {
    return buildFreshData();
  }
}

/** Thrown when localStorage is full (photos make this the one realistic way to hit the quota). */
export class StorageQuotaError extends Error {}

export function writeData(data: AppData): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    throw new StorageQuotaError(
      "This browser's storage is full. Try removing a journal photo or resetting demo data."
    );
  }
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
