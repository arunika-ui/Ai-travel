import { AppSettings } from "@/lib/trips/types";
import { DEFAULT_APP_SETTINGS } from "@/lib/mock-data/users";
import { readData, updateData } from "@/lib/data/localDb";

export function getSettings(): AppSettings {
  return readData().settings;
}

export function updateSettings(patch: Partial<AppSettings>): AppSettings {
  let next: AppSettings = { ...DEFAULT_APP_SETTINGS };
  updateData((data) => {
    next = { ...data.settings, ...patch };
    return { ...data, settings: next };
  });
  return next;
}
