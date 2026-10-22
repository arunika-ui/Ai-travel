import { nanoid } from "nanoid";
import { TravelAgent, AgentStep, AgentCommandResult, GenerateItineraryResult } from "@/lib/ai/TravelAgent";
import { Activity, DayPlan, PlaceCategory, Trip } from "@/lib/trips/types";
import { generateItinerary } from "@/lib/ai/generateItinerary";
import { parseIntent } from "@/lib/ai/intentParser";
import { getWeather } from "@/lib/tools/getWeather";
import { searchPlaces } from "@/lib/tools/searchPlaces";
import { findAllOverlaps, itineraryTotalCost, fitToBudget } from "@/lib/validation/businessRules";
import { totalsByCategory } from "@/lib/trips/expense";

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const SLOT_START_MINUTES: Record<string, number> = {
  morning: 9 * 60,
  afternoon: 14 * 60,
  evening: 18 * 60,
};

function findActivityLocation(
  days: DayPlan[],
  target: string
): { dayIdx: number; actIdx: number } | null {
  const needle = target.toLowerCase();
  for (let d = 0; d < days.length; d++) {
    for (let a = 0; a < days[d].activities.length; a++) {
      if (days[d].activities[a].title.toLowerCase().includes(needle)) {
        return { dayIdx: d, actIdx: a };
      }
    }
  }
  return null;
}

function cloneDays(days: DayPlan[]): DayPlan[] {
  return days.map((d) => ({ ...d, activities: d.activities.map((a) => ({ ...a })) }));
}

export class MockTravelAgent implements TravelAgent {
  generateItinerary(trip: Trip): GenerateItineraryResult {
    const steps: AgentStep[] = [
      { tool: "getWeather", args: { cityId: trip.destination }, resultSummary: "Checked forecast for every day of the trip." },
      { tool: "searchPlaces", args: { cityId: trip.destination, interests: trip.interests }, resultSummary: `Searched places in ${trip.destination} matching your interests.` },
      { tool: "getItinerary", args: { tripId: trip.id }, resultSummary: "Checked budget against estimated activity costs." },
    ];
    const days = generateItinerary(trip);
    return { steps, days };
  }

  handleCommand(trip: Trip, currentDays: DayPlan[], text: string, maxToolCalls: number): AgentCommandResult {
    const intent = parseIntent(text);
    const steps: AgentStep[] = [];
    let toolCalls = 0;
    function callTool<T>(tool: string, args: Record<string, unknown>, run: () => { summary: string; value: T }): T | undefined {
      if (toolCalls >= maxToolCalls) return undefined;
      toolCalls++;
      const { summary, value } = run();
      steps.push({ tool, args, resultSummary: summary });
      return value;
    }

    switch (intent.type) {
      case "weatherQuestion": {
        const day = intent.day ? currentDays.find((d) => d.dayNumber === intent.day) : currentDays[1] ?? currentDays[0];
        if (!day) {
          return { status: "REJECTED", reply: "I couldn't find that day in the itinerary.", steps };
        }
        const summary = callTool("getWeather", { cityId: trip.destination, date: day.date }, () => {
          const w = getWeather.execute({ cityId: trip.destination, date: day.date });
          return {
            summary: `${w.condition}, ${w.tempC}°C, evening rain ${w.eveningRainChance}%`,
            value: `${w.condition}, around ${w.tempC}°C. Evening rain chance is ${w.eveningRainChance}%.`,
          };
        }) ?? "forecast unavailable";
        return {
          status: "ANSWERED",
          reply: `Day ${day.dayNumber} (${day.date}) in ${trip.destination}: ${summary}`,
          steps,
        };
      }

      case "spendingQuestion": {
        const totals = totalsByCategory(trip.id);
        if (intent.category) {
          const cat = (intent.category.charAt(0).toUpperCase() + intent.category.slice(1)) as keyof typeof totals;
          const amount = totals[cat] ?? 0;
          return {
            status: "ANSWERED",
            reply: `You've spent ₹${amount.toLocaleString("en-IN")} on ${intent.category} so far.`,
            steps,
          };
        }
        const total = Object.values(totals).reduce((s, v) => s + v, 0);
        return { status: "ANSWERED", reply: `You've spent ₹${total.toLocaleString("en-IN")} in total so far.`, steps };
      }

      case "placesQuestion": {
        const categoryGuess = guessCategory(intent.query);
        const results =
          callTool("searchPlaces", { cityId: trip.destination, category: categoryGuess, query: intent.query }, () => {
            const found = searchPlaces.execute({ cityId: trip.destination, category: categoryGuess ?? undefined, query: categoryGuess ? undefined : intent.query });
            return { summary: `Found ${found.length} matching places.`, value: found };
          }) ?? [];
        if (results.length === 0) {
          return { status: "ANSWERED", reply: "I couldn't find a close match in the sample data for that — try another category like food, market or nature.", steps };
        }
        const names = results.slice(0, 4).map((p) => `${p.name} (₹${p.costPerPersonINR}/person, rated ${p.rating})`);
        return { status: "ANSWERED", reply: `Here are a few options: ${names.join("; ")}.`, steps };
      }

      case "swap": {
        if (!intent.target) {
          return { status: "REJECTED", reply: "Tell me which activity to swap, e.g. \"swap the day 2 evening activity for something indoor\".", steps };
        }
        const loc = findActivityLocation(currentDays, intent.target);
        if (!loc) {
          return { status: "REJECTED", reply: `I couldn't find an activity matching "${intent.target}" in the itinerary. Try naming it more exactly.`, steps };
        }
        const days = cloneDays(currentDays);
        const oldActivity = days[loc.dayIdx].activities[loc.actIdx];
        const wantsIndoor = intent.reason === "rain" || intent.reason === "indoor" || /rain|indoor/.test(text.toLowerCase());
        const wantsCheaper = intent.reason === "cheap" || /cheaper|cheap/.test(text.toLowerCase());

        const replacement = callTool(
          "searchPlaces",
          { cityId: trip.destination, indoor: wantsIndoor || undefined, maxCostPerPerson: wantsCheaper ? oldActivity.estCost - 1 : undefined },
          () => {
            const results = searchPlaces.execute({
              cityId: trip.destination,
              indoor: wantsIndoor || undefined,
              maxCostPerPerson: wantsCheaper ? Math.max(oldActivity.estCost - 1, 0) : undefined,
            });
            const usedIds = new Set(days.flatMap((d) => d.activities.map((a) => a.placeId)));
            const found = results.find((p) => !usedIds.has(p.id)) ?? results[0] ?? null;
            return { summary: found ? `Found replacement: ${found.name}.` : "No suitable replacement found.", value: found };
          }
        );

        if (wantsIndoor) {
          callTool("getWeather", { cityId: trip.destination, date: days[loc.dayIdx].date }, () => ({
            summary: "Confirmed rain risk for that evening.",
            value: null,
          }));
        }

        if (!replacement) {
          return { status: "REJECTED", reply: "I couldn't find a suitable replacement in the sample data for that request.", steps };
        }

        const start = timeToMinutes(oldActivity.startTime);
        const newActivity: Activity = {
          id: nanoid(8),
          title: replacement.name,
          startTime: minutesToTime(start),
          endTime: minutesToTime(start + replacement.durationMinutes),
          category: replacement.category,
          estCost: replacement.costPerPersonINR,
          notes: wantsIndoor ? "Swapped to indoor due to rain risk" : "Swapped per request",
          placeId: replacement.id,
          lat: replacement.lat,
          lng: replacement.lng,
        };
        days[loc.dayIdx].activities[loc.actIdx] = newActivity;

        const overlaps = findAllOverlaps({ id: "", tripId: trip.id, version: 0, isCurrent: true, createdAt: "", days });
        if (overlaps.length > 0) {
          return { status: "REJECTED", reply: "That swap would overlap with another activity, so I left the itinerary unchanged.", steps };
        }

        return {
          status: "APPLIED",
          reply: `Swapped "${oldActivity.title}" for "${newActivity.title}" on Day ${days[loc.dayIdx].dayNumber}.`,
          steps,
          updatedDays: days,
          rememberedFact: wantsIndoor
            ? { key: "evening-preference", value: "Prefers indoor activities on rainy evenings" }
            : undefined,
        };
      }

      case "add": {
        const days = cloneDays(currentDays);
        const dayIdx = intent.day ? days.findIndex((d) => d.dayNumber === intent.day) : 0;
        if (dayIdx === -1) {
          return { status: "REJECTED", reply: `Day ${intent.day} doesn't exist in this itinerary.`, steps };
        }
        const category = (intent.category as PlaceCategory) ?? "cafe";
        const found = callTool("searchPlaces", { cityId: trip.destination, category }, () => {
          const usedIds = new Set(days.flatMap((d) => d.activities.map((a) => a.placeId)));
          const results = searchPlaces.execute({ cityId: trip.destination, category });
          const place = results.find((p) => !usedIds.has(p.id)) ?? results[0] ?? null;
          return { summary: place ? `Found ${place.name}.` : "No match found.", value: place };
        });
        if (!found) {
          return { status: "REJECTED", reply: `I couldn't find a ${category} place to add in the sample data.`, steps };
        }
        const startMinutes = SLOT_START_MINUTES[intent.timeOfDay ?? "afternoon"];
        const newActivity: Activity = {
          id: nanoid(8),
          title: found.name,
          startTime: minutesToTime(startMinutes),
          endTime: minutesToTime(startMinutes + found.durationMinutes),
          category: found.category,
          estCost: found.costPerPersonINR,
          notes: "Added per request",
          placeId: found.id,
          lat: found.lat,
          lng: found.lng,
        };
        days[dayIdx].activities.push(newActivity);
        days[dayIdx].activities.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

        const overlaps = findAllOverlaps({ id: "", tripId: trip.id, version: 0, isCurrent: true, createdAt: "", days });
        if (overlaps.length > 0) {
          return { status: "REJECTED", reply: "Adding that would overlap with another activity at that time, so I left the itinerary unchanged.", steps };
        }

        return {
          status: "APPLIED",
          reply: `Added "${newActivity.title}" to Day ${days[dayIdx].dayNumber}.`,
          steps,
          updatedDays: days,
        };
      }

      case "remove": {
        const days = cloneDays(currentDays);
        const loc = findActivityLocation(days, intent.target);
        if (!loc) {
          return { status: "REJECTED", reply: `I couldn't find an activity matching "${intent.target}".`, steps };
        }
        const removed = days[loc.dayIdx].activities.splice(loc.actIdx, 1)[0];
        return {
          status: "APPLIED",
          reply: `Removed "${removed.title}" from Day ${days[loc.dayIdx].dayNumber}.`,
          steps,
          updatedDays: days,
        };
      }

      case "move": {
        const days = cloneDays(currentDays);
        const loc = findActivityLocation(days, intent.target);
        if (!loc) {
          return { status: "REJECTED", reply: `I couldn't find an activity matching "${intent.target}".`, steps };
        }
        const [activity] = days[loc.dayIdx].activities.splice(loc.actIdx, 1);
        const targetDayIdx = intent.day ? days.findIndex((d) => d.dayNumber === intent.day) : loc.dayIdx;
        if (targetDayIdx === -1) {
          return { status: "REJECTED", reply: `Day ${intent.day} doesn't exist in this itinerary.`, steps };
        }
        const duration = timeToMinutes(activity.endTime) - timeToMinutes(activity.startTime);
        const startMinutes = intent.timeOfDay ? SLOT_START_MINUTES[intent.timeOfDay] : timeToMinutes(activity.startTime);
        const moved: Activity = {
          ...activity,
          startTime: minutesToTime(startMinutes),
          endTime: minutesToTime(startMinutes + duration),
        };
        days[targetDayIdx].activities.push(moved);
        days[targetDayIdx].activities.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

        const overlaps = findAllOverlaps({ id: "", tripId: trip.id, version: 0, isCurrent: true, createdAt: "", days });
        if (overlaps.length > 0) {
          return { status: "REJECTED", reply: "Moving that would overlap with another activity, so I left the itinerary unchanged.", steps };
        }

        return {
          status: "APPLIED",
          reply: `Moved "${moved.title}" to Day ${days[targetDayIdx].dayNumber} ${intent.timeOfDay ?? ""}.`.trim(),
          steps,
          updatedDays: days,
        };
      }

      case "pace": {
        const days = cloneDays(currentDays);
        const targetDays = intent.day ? days.filter((d) => d.dayNumber === intent.day) : days;
        if (targetDays.length === 0) {
          return { status: "REJECTED", reply: `Day ${intent.day} doesn't exist in this itinerary.`, steps };
        }
        if (intent.direction === "relax") {
          for (const day of targetDays) {
            const removable = day.activities.filter((a) => a.category !== "food");
            if (removable.length > 2) {
              const cheapest = removable.sort((a, b) => a.estCost - b.estCost)[0];
              day.activities = day.activities.filter((a) => a.id !== cheapest.id);
            }
          }
          return { status: "APPLIED", reply: "Made the plan more relaxed by trimming an activity.", steps, updatedDays: days };
        } else {
          let addedAny = false;
          for (const day of targetDays) {
            const found = callTool("searchPlaces", { cityId: trip.destination }, () => {
              const usedIds = new Set(days.flatMap((d) => d.activities.map((a) => a.placeId)));
              const results = searchPlaces.execute({ cityId: trip.destination });
              const place = results.find((p) => !usedIds.has(p.id)) ?? null;
              return { summary: place ? `Found ${place.name}.` : "No match found.", value: place };
            });
            if (found) {
              const lastEnd = Math.max(...day.activities.map((a) => timeToMinutes(a.endTime)), 9 * 60);
              const start = lastEnd + 15;
              day.activities.push({
                id: nanoid(8),
                title: found.name,
                startTime: minutesToTime(start),
                endTime: minutesToTime(start + found.durationMinutes),
                category: found.category,
                estCost: found.costPerPersonINR,
                notes: "Added to pack the day more",
                placeId: found.id,
                lat: found.lat,
                lng: found.lng,
              });
              addedAny = true;
            }
          }
          return {
            status: addedAny ? "APPLIED" : "REJECTED",
            reply: addedAny ? "Packed more into the day." : "Couldn't find anything else to add from the sample data.",
            steps,
            updatedDays: days,
          };
        }
      }

      case "budget": {
        const targetBudget = intent.amount ?? trip.budget;
        const draft = { id: "", tripId: trip.id, version: 0, isCurrent: true, createdAt: "", days: cloneDays(currentDays) };
        const before = itineraryTotalCost(draft);
        const fitted = fitToBudget(draft, targetBudget);
        const after = itineraryTotalCost(fitted);
        callTool("getItinerary", { tripId: trip.id }, () => ({
          summary: `Total before: ₹${before}, after: ₹${after}.`,
          value: null,
        }));
        if (after >= before) {
          return { status: "ANSWERED", reply: `The plan is already within ₹${targetBudget.toLocaleString("en-IN")}.`, steps };
        }
        return {
          status: "APPLIED",
          reply: `Trimmed the plan from ₹${before.toLocaleString("en-IN")} to ₹${after.toLocaleString("en-IN")} to fit the budget.`,
          steps,
          updatedDays: fitted.days,
        };
      }

      default:
        return {
          status: "REJECTED",
          reply:
            "I'm not sure how to do that yet. I can: swap or replace an activity, add or remove a stop, move something to another day, make a day more relaxed or packed, fit the plan to a budget, answer weather or spending questions, or suggest places.",
          steps,
        };
    }
  }
}

function guessCategory(text: string): PlaceCategory | undefined {
  const map: Record<string, PlaceCategory> = {
    food: "food", vegetarian: "food", restaurant: "food", eat: "food",
    cafe: "cafe", coffee: "cafe",
    market: "market", shopping: "shopping", shop: "shopping",
    museum: "museum", heritage: "heritage", fort: "heritage", palace: "heritage", temple: "temple",
    nature: "nature", adventure: "adventure", beach: "beach", lake: "lake", nightlife: "nightlife",
  };
  const lower = text.toLowerCase();
  for (const key of Object.keys(map)) {
    if (lower.includes(key)) return map[key];
  }
  return undefined;
}

export const mockTravelAgent = new MockTravelAgent();
