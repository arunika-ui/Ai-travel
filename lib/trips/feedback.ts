import { Feedback } from "@/lib/trips/types";
import { readData, updateData } from "@/lib/data/localDb";

export function getFeedback(tripId: string): Feedback | null {
  return readData().feedback.find((f) => f.tripId === tripId) ?? null;
}

export function submitFeedback(feedback: Feedback): void {
  updateData((data) => {
    const existingIdx = data.feedback.findIndex((f) => f.tripId === feedback.tripId);
    const next = [...data.feedback];
    if (existingIdx >= 0) next[existingIdx] = feedback;
    else next.push(feedback);
    return { ...data, feedback: next };
  });
}

export function averageRating(): number {
  const all = readData().feedback;
  if (all.length === 0) return 0;
  return Math.round((all.reduce((s, f) => s + f.rating, 0) / all.length) * 10) / 10;
}
