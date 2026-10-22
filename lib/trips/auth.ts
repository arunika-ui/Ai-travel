import { nanoid } from "nanoid";
import { User } from "@/lib/trips/types";
import { readData, updateData } from "@/lib/data/localDb";

const LOCKOUT_MINUTES = 15;
const MAX_ATTEMPTS = 5;

export interface LoginResult {
  user: User | null;
  error: string | null;
}

/**
 * Simulates FR-1.4/FR-1.5: checks credentials and locks an email out for
 * 15 minutes after 5 failed attempts within this browser's local data.
 * There is no real server-side session — this is prototype-only.
 */
export function login(email: string, password: string): LoginResult {
  const normalizedEmail = email.trim().toLowerCase();
  const data = readData();
  const attempt = data.loginAttempts[normalizedEmail];

  if (attempt?.lockedUntil && new Date(attempt.lockedUntil) > new Date()) {
    const minutesLeft = Math.ceil((new Date(attempt.lockedUntil).getTime() - Date.now()) / 60000);
    return {
      user: null,
      error: `Too many failed attempts. Try again in about ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}.`,
    };
  }

  const user = data.users.find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
  );

  if (!user) {
    const nextCount = (attempt?.count ?? 0) + 1;
    const lockedUntil =
      nextCount >= MAX_ATTEMPTS
        ? new Date(Date.now() + LOCKOUT_MINUTES * 60000).toISOString()
        : null;
    updateData((d) => ({
      ...d,
      loginAttempts: { ...d.loginAttempts, [normalizedEmail]: { count: nextCount, lockedUntil } },
    }));
    return {
      user: null,
      error: lockedUntil
        ? `Too many failed attempts. Try again in ${LOCKOUT_MINUTES} minutes.`
        : "Email or password is incorrect.",
    };
  }

  if (!user.active) {
    return { user: null, error: "This account has been suspended. Contact an administrator." };
  }

  updateData((d) => ({
    ...d,
    sessionUserId: user.id,
    loginAttempts: { ...d.loginAttempts, [normalizedEmail]: { count: 0, lockedUntil: null } },
  }));
  return { user, error: null };
}

export interface RegisterResult {
  user: User | null;
  error: string | null;
}

/**
 * Simulates FR-1.1/FR-1.2/FR-1.3: creates a new traveler account in local
 * storage and logs in immediately (no real email verification is possible
 * without a backend, so this prototype skips straight to a verified state).
 */
export function register(name: string, email: string, password: string): RegisterResult {
  const normalizedEmail = email.trim().toLowerCase();
  const data = readData();

  if (data.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return { user: null, error: "An account with that email already exists." };
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return { user: null, error: passwordError };
  }

  const user: User = {
    id: `user-${nanoid(8)}`,
    name: name.trim() || "Traveler",
    email: normalizedEmail,
    password,
    role: "traveler",
    homeCity: "",
    preferences: {
      style: "",
      pace: "moderate",
      budgetLevel: "mid",
      interests: [],
      dietaryNeeds: "",
    },
    active: true,
  };

  updateData((d) => ({ ...d, users: [...d.users, user], sessionUserId: user.id }));
  return { user, error: null };
}

/** FR-1.2: at least 8 characters, one letter and one digit. */
export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-zA-Z]/.test(password)) return "Password must include at least one letter.";
  if (!/[0-9]/.test(password)) return "Password must include at least one digit.";
  return null;
}

/**
 * Simulates FR-1.6. There's no real email service, so this prototype just
 * resets the password directly after confirming the account exists.
 */
export function resetPassword(email: string, newPassword: string): string | null {
  const passwordError = validatePassword(newPassword);
  if (passwordError) return passwordError;

  const normalizedEmail = email.trim().toLowerCase();
  const data = readData();
  if (!data.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return "No account found with that email.";
  }
  updateData((d) => ({
    ...d,
    users: d.users.map((u) =>
      u.email.toLowerCase() === normalizedEmail ? { ...u, password: newPassword } : u
    ),
  }));
  return null;
}

export function logout(): void {
  updateData((data) => ({ ...data, sessionUserId: null }));
}

export function getCurrentUser(): User | null {
  const data = readData();
  if (!data.sessionUserId) return null;
  return data.users.find((u) => u.id === data.sessionUserId) ?? null;
}

export function listUsers(): User[] {
  return readData().users;
}

export function setUserActive(id: string, active: boolean): void {
  updateData((data) => ({
    ...data,
    users: data.users.map((u) => (u.id === id ? { ...u, active } : u)),
  }));
}

export function updatePreferences(userId: string, patch: Partial<User["preferences"]>): void {
  updateData((data) => ({
    ...data,
    users: data.users.map((u) =>
      u.id === userId ? { ...u, preferences: { ...u.preferences, ...patch } } : u
    ),
  }));
}

export function updateProfile(userId: string, patch: Partial<Pick<User, "name" | "homeCity">>): void {
  updateData((data) => ({
    ...data,
    users: data.users.map((u) => (u.id === userId ? { ...u, ...patch } : u)),
  }));
}

/** FR-1.8: removes the account and everything owned by it from local storage. */
export function deleteAccount(userId: string): void {
  updateData((data) => {
    const ownedTripIds = new Set(data.trips.filter((t) => t.ownerId === userId).map((t) => t.id));
    return {
      ...data,
      users: data.users.filter((u) => u.id !== userId),
      trips: data.trips.filter((t) => t.ownerId !== userId),
      itineraries: data.itineraries.filter((i) => !ownedTripIds.has(i.tripId)),
      expenses: data.expenses.filter((e) => !ownedTripIds.has(e.tripId)),
      memories: data.memories.filter((m) => !ownedTripIds.has(m.tripId)),
      commandLogs: data.commandLogs.filter((c) => !ownedTripIds.has(c.tripId)),
      feedback: data.feedback.filter((f) => !ownedTripIds.has(f.tripId)),
      sessionUserId: data.sessionUserId === userId ? null : data.sessionUserId,
    };
  });
}
