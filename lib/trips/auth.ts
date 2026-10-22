import { User } from "@/lib/trips/types";
import { readData, updateData } from "@/lib/data/localDb";

export function login(email: string, password: string): User | null {
  const user = readData().users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.active
  );
  if (!user) return null;
  updateData((data) => ({ ...data, sessionUserId: user.id }));
  return user;
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
