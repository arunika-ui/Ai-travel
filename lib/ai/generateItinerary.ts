import { nanoid } from "nanoid";
import { Activity, DayPlan, Pace, Place, PlaceCategory, Trip } from "@/lib/trips/types";
import { getHotelsForCity, getPlacesForCity } from "@/lib/mock-data/destinations";
import { getWeatherForecast } from "@/lib/mock-data/weather";
import { tripLengthDays } from "@/lib/validation/schemas";
import { fitToBudget } from "@/lib/validation/businessRules";

const ACTIVITIES_PER_DAY: Record<Pace, number> = {
  relaxed: 3,
  moderate: 4,
  packed: 5,
};

function addDaysISO(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function toActivity(place: Place, startMinutes: number, notes = ""): Activity {
  return {
    id: nanoid(8),
    title: place.name,
    startTime: minutesToTime(startMinutes),
    endTime: minutesToTime(startMinutes + place.durationMinutes),
    category: place.category,
    estCost: place.costPerPersonINR,
    notes,
    placeId: place.id,
    lat: place.lat,
    lng: place.lng,
  };
}

function pickNext(pool: Place[], used: Set<string>, interests: PlaceCategory[]): Place | null {
  const scored = pool
    .filter((p) => !used.has(p.id))
    .sort((a, b) => {
      const aMatch = interests.includes(a.category) ? 1 : 0;
      const bMatch = interests.includes(b.category) ? 1 : 0;
      if (aMatch !== bMatch) return bMatch - aMatch;
      return b.rating - a.rating;
    });
  if (scored.length > 0) return scored[0];
  // Allow reuse once every non-food place has been used, so short trips don't run out.
  const fallback = pool
    .filter((p) => p.category !== "food")
    .sort((a, b) => b.rating - a.rating);
  return fallback[0] ?? null;
}

function buildDayReason(indoorOnly: boolean, interests: PlaceCategory[], usedCategories: Set<string>): string {
  if (indoorOnly) {
    return "Evening moved indoors because rain is likely; sightseeing kept to the morning.";
  }
  const matched = [...usedCategories].filter((c) => interests.includes(c as PlaceCategory));
  if (matched.length > 0) {
    return `Day built around your interest in ${matched.slice(0, 2).join(" and ")}, with a travel gap before and after each stop.`;
  }
  return "A balanced day mixing sightseeing with meal stops and travel gaps.";
}

export function generateItinerary(trip: Trip): DayPlan[] {
  const allPlaces = getPlacesForCity(trip.destination);
  const hotels = getHotelsForCity(trip.destination);
  const hotel = hotels[0];
  const days = tripLengthDays(trip.startDate, trip.endDate);
  const activitiesPerDay = ACTIVITIES_PER_DAY[trip.pace];

  const foodPlaces = allPlaces.filter((p) => p.category === "food" || p.category === "cafe");
  const nonFoodPlaces = allPlaces.filter((p) => p.category !== "food" && p.category !== "cafe");

  const usedNonFood = new Set<string>();
  const usedFood = new Set<string>();
  const dayPlans: DayPlan[] = [];

  for (let dayNum = 1; dayNum <= days; dayNum++) {
    const date = addDaysISO(trip.startDate, dayNum - 1);
    const weather = getWeatherForecast(trip.destination, date);
    const eveningIsRainy = weather.eveningRainChance > 60;

    const activities: Activity[] = [];
    const usedCategoriesToday = new Set<string>();
    let clock = 9 * 60; // 09:00

    const sightseeingSlots = Math.max(activitiesPerDay - 2, 1); // minus lunch & dinner
    const morningSlots = Math.ceil(sightseeingSlots / 2);
    const afternoonEveningSlots = sightseeingSlots - morningSlots;

    // Morning sightseeing (prefer outdoor if weather is fine).
    for (let i = 0; i < morningSlots; i++) {
      const pool = eveningIsRainy && clock >= 16 * 60 ? nonFoodPlaces.filter((p) => p.indoor) : nonFoodPlaces;
      const place = pickNext(pool, usedNonFood, trip.interests);
      if (!place) break;
      usedNonFood.add(place.id);
      usedCategoriesToday.add(place.category);
      activities.push(toActivity(place, clock));
      clock += place.durationMinutes + 15; // travel/buffer gap
    }

    // Lunch.
    clock = Math.max(clock, 12 * 60 + 30);
    const lunchPlace = pickNext(foodPlaces, usedFood, trip.interests) ?? foodPlaces[0];
    if (lunchPlace) {
      usedFood.add(lunchPlace.id);
      activities.push(toActivity(lunchPlace, clock, "Lunch"));
      clock = timeToMinutesLocal(activities[activities.length - 1].endTime) + 20;
    }

    // Afternoon/evening sightseeing — forced indoor if rain risk after 5pm.
    clock = Math.max(clock, 14 * 60);
    for (let i = 0; i < afternoonEveningSlots; i++) {
      const forceIndoor = eveningIsRainy && clock >= 16 * 60;
      const pool = forceIndoor ? nonFoodPlaces.filter((p) => p.indoor) : nonFoodPlaces;
      const place = pickNext(pool, usedNonFood, trip.interests);
      if (!place) break;
      usedNonFood.add(place.id);
      usedCategoriesToday.add(place.category);
      activities.push(toActivity(place, clock, forceIndoor ? "Moved indoors — rain expected" : ""));
      clock += place.durationMinutes + 15;
    }

    // Dinner.
    clock = Math.max(clock, 19 * 60 + 30);
    const dinnerPlace = pickNext(foodPlaces, usedFood, trip.interests) ?? foodPlaces[1] ?? foodPlaces[0];
    if (dinnerPlace) {
      usedFood.add(dinnerPlace.id);
      activities.push(toActivity(dinnerPlace, clock, "Dinner"));
    }

    dayPlans.push({
      dayNumber: dayNum,
      date,
      theme: [...usedCategoriesToday][0] ? titleCase([...usedCategoriesToday][0]) : "Exploring " + trip.destination,
      reason: buildDayReason(eveningIsRainy, trip.interests, usedCategoriesToday),
      activities,
    });
  }

  const budgetForActivities = trip.budget - (hotel ? hotel.pricePerNightINR * (days - 1 || 1) : 0);
  const draftItinerary = { id: "", tripId: trip.id, version: 0, isCurrent: true, createdAt: "", days: dayPlans };
  const fitted = fitToBudget(draftItinerary, Math.max(budgetForActivities, trip.budget * 0.3));

  return fitted.days;
}

/** Regenerates a single day's activities, avoiding places already used elsewhere in the trip. */
export function regenerateDay(trip: Trip, currentDays: DayPlan[], dayNumber: number): DayPlan {
  const target = currentDays.find((d) => d.dayNumber === dayNumber);
  if (!target) throw new Error(`Day ${dayNumber} not found`);

  const allPlaces = getPlacesForCity(trip.destination);
  const foodPlaces = allPlaces.filter((p) => p.category === "food" || p.category === "cafe");
  const nonFoodPlaces = allPlaces.filter((p) => p.category !== "food" && p.category !== "cafe");

  const usedElsewhere = new Set<string>(
    currentDays
      .filter((d) => d.dayNumber !== dayNumber)
      .flatMap((d) => d.activities.map((a) => a.placeId))
      .concat(target.activities.map((a) => a.placeId)) // also avoid repeating what's already there
      .filter((id): id is string => id !== null)
  );

  const weather = getWeatherForecast(trip.destination, target.date);
  const eveningIsRainy = weather.eveningRainChance > 60;
  const activitiesPerDay = ACTIVITIES_PER_DAY[trip.pace];
  const sightseeingSlots = Math.max(activitiesPerDay - 2, 1);
  const morningSlots = Math.ceil(sightseeingSlots / 2);
  const afternoonEveningSlots = sightseeingSlots - morningSlots;

  const activities: Activity[] = [];
  let clock = 9 * 60;
  const usedNow = new Set<string>(usedElsewhere);

  for (let i = 0; i < morningSlots; i++) {
    const pool = eveningIsRainy && clock >= 16 * 60 ? nonFoodPlaces.filter((p) => p.indoor) : nonFoodPlaces;
    const place = pickNext(pool, usedNow, trip.interests);
    if (!place) break;
    usedNow.add(place.id);
    activities.push(toActivity(place, clock));
    clock += place.durationMinutes + 15;
  }

  clock = Math.max(clock, 12 * 60 + 30);
  const lunchPlace = pickNext(foodPlaces, usedNow, trip.interests) ?? foodPlaces[0];
  if (lunchPlace) {
    usedNow.add(lunchPlace.id);
    activities.push(toActivity(lunchPlace, clock, "Lunch"));
    clock = timeToMinutesLocal(activities[activities.length - 1].endTime) + 20;
  }

  clock = Math.max(clock, 14 * 60);
  for (let i = 0; i < afternoonEveningSlots; i++) {
    const forceIndoor = eveningIsRainy && clock >= 16 * 60;
    const pool = forceIndoor ? nonFoodPlaces.filter((p) => p.indoor) : nonFoodPlaces;
    const place = pickNext(pool, usedNow, trip.interests);
    if (!place) break;
    usedNow.add(place.id);
    activities.push(toActivity(place, clock, forceIndoor ? "Moved indoors — rain expected" : ""));
    clock += place.durationMinutes + 15;
  }

  clock = Math.max(clock, 19 * 60 + 30);
  const dinnerPlace = pickNext(foodPlaces, usedNow, trip.interests) ?? foodPlaces[1] ?? foodPlaces[0];
  if (dinnerPlace) {
    activities.push(toActivity(dinnerPlace, clock, "Dinner"));
  }

  return {
    ...target,
    reason: buildDayReason(eveningIsRainy, trip.interests, new Set(activities.map((a) => a.category))),
    activities,
  };
}

function timeToMinutesLocal(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
