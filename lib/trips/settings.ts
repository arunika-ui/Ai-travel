import { AppSettings } from "@/lib/trips/types";
import { readData, updateData } from "@/lib/data/localDb";

export function getSettings(): AppSettings {
  return readData().settings;
}

export function updateSettings(patch: Partial<AppSettings>): AppSettings {
  let next: AppSettings = { maxToolCallsPerCommand: 5, dailyAICommandLimit: 20 };
  updateData((data) => {
    next = { ...data.settings, ...patch };
    return { ...data, settings: next };
  });
  return next;
}
