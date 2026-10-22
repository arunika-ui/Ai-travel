import { z } from "zod";
import { Itinerary, TripInput } from "@/lib/types";
import { tripLengthDays } from "@/lib/validation";

const activitySchema = z.object({
  time: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  location: z.object({
    name: z.string().min(1),
    lat: z.number().nullable(),
    lng: z.number().nullable(),
  }),
  estimatedCostINR: z.number().min(0),
});

const dayPlanSchema = z.object({
  day: z.number().int().min(1),
  date: z.string(),
  summary: z.string().min(1),
  reason: z.string().min(1),
  weatherNote: z.string().optional(),
  activities: z.array(activitySchema).min(1),
});

export const itinerarySchema = z.object({
  days: z.array(dayPlanSchema).min(1),
  totalEstimatedCostINR: z.number().min(0),
  notes: z.string().optional(),
});

export interface ItineraryIssue {
  type: "budget" | "overlap" | "schema";
  message: string;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Validates business rules the model is instructed to follow but may
 * not always honor: the plan must not exceed budget, must not have
 * overlapping activity times within a day, and must cover the right
 * number of days.
 */
export function validateItinerary(
  itinerary: Itinerary,
  input: TripInput
): ItineraryIssue[] {
  const issues: ItineraryIssue[] = [];

  const expectedDays = tripLengthDays(input.startDate, input.endDate);
  if (itinerary.days.length !== expectedDays) {
    issues.push({
      type: "schema",
      message: `Itinerary has ${itinerary.days.length} days but trip is ${expectedDays} days long.`,
    });
  }

  const computedTotal = itinerary.days.reduce(
    (sum, day) =>
      sum + day.activities.reduce((daySum, a) => daySum + a.estimatedCostINR, 0),
    0
  );

  if (computedTotal > input.budgetINR) {
    issues.push({
      type: "budget",
      message: `Estimated total cost ₹${computedTotal.toLocaleString(
        "en-IN"
      )} exceeds the budget of ₹${input.budgetINR.toLocaleString("en-IN")}.`,
    });
  }

  for (const day of itinerary.days) {
    const sorted = [...day.activities].sort(
      (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)
    );
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      if (timeToMinutes(current.endTime) > timeToMinutes(next.time)) {
        issues.push({
          type: "overlap",
          message: `Day ${day.day}: "${current.title}" (${current.time}-${current.endTime}) overlaps with "${next.title}" (${next.time}-${next.endTime}).`,
        });
      }
    }
  }

  return issues;
}

export function buildItinerarySystemPrompt(input: TripInput): string {
  const days = tripLengthDays(input.startDate, input.endDate);
  return `You are an expert travel planner. Build a realistic, timed, day-by-day itinerary.

Trip details:
- Destination: ${input.destination}
- Dates: ${input.startDate} to ${input.endDate} (${days} day${days > 1 ? "s" : ""})
- Travelers: ${input.travelers}
- Total budget: ₹${input.budgetINR} INR for the whole trip, all travelers combined
- Interests: ${input.interests.join(", ")}
- Pace: ${input.pace}

Rules you MUST follow:
1. Use the geocode and searchPlaces tools to find real places and coordinates in and around ${input.destination}. Use getWeather to check forecasts for outdoor activities and note rain risk.
2. Produce exactly ${days} day(s), numbered 1 to ${days}, with dates from ${input.startDate} to ${input.endDate}.
3. Each day has 3-6 timed activities with "time" and "endTime" in 24h HH:MM format. Activities within a day must NOT overlap and must be in chronological order.
4. The SUM of all estimatedCostINR across all activities and all days MUST be less than or equal to ₹${input.budgetINR}. This is a hard constraint. Leave margin for the "moderate"/"packed" pace.
5. For each day, write a one-sentence "reason" explaining why that day's plan fits the travelers' interests and pace.
6. Give every activity a location with a name and, when available from your tool calls, lat/lng. If coordinates are unavailable, set lat and lng to null.
7. Reply with ONLY valid JSON (no markdown, no prose) matching exactly this shape:
{
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "summary": "short title for the day",
      "reason": "why this fits the traveler",
      "weatherNote": "optional short note about forecast",
      "activities": [
        {
          "time": "09:00",
          "endTime": "11:00",
          "title": "...",
          "description": "...",
          "category": "food|sightseeing|nature|shopping|culture|transport|other",
          "location": { "name": "...", "lat": 00.0, "lng": 00.0 },
          "estimatedCostINR": 500
        }
      ]
    }
  ],
  "totalEstimatedCostINR": 12345,
  "notes": "optional overall notes"
}`;
}
