import { nanoid } from "nanoid";
import {
  AICommandLog,
  Activity,
  DayPlan,
  Expense,
  Itinerary,
  Trip,
  TripMemory,
} from "@/lib/trips/types";
import { getPlacesForCity } from "@/lib/mock-data/destinations";

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function activity(
  title: string,
  startTime: string,
  endTime: string,
  category: Activity["category"],
  estCost: number,
  placeId: string | null,
  notes = ""
): Activity {
  return { id: nanoid(8), title, startTime, endTime, category, estCost, notes, placeId };
}

function udaipurItinerary(tripId: string, startDate: string): Itinerary[] {
  const places = getPlacesForCity("udaipur");
  const byName = (n: string) => places.find((p) => p.name === n);

  const day1: DayPlan = {
    dayNumber: 1,
    date: startDate,
    theme: "Palaces & the lake",
    reason: "Heritage sights scheduled for the cooler morning hours, with a lakeside lunch.",
    activities: [
      activity("City Palace", "09:00", "11:00", "heritage", 300, byName("City Palace")?.id ?? null),
      activity("Jagdish Temple", "11:15", "12:00", "temple", 0, byName("Jagdish Temple")?.id ?? null),
      activity("Ambrai Restaurant (lunch)", "12:30", "13:45", "food", 800, byName("Ambrai Restaurant")?.id ?? null),
      activity("Bagore Ki Haveli Museum", "15:00", "16:15", "museum", 150, byName("Bagore Ki Haveli Museum")?.id ?? null),
      activity("Natraj Dining Hall (dinner)", "19:30", "20:30", "food", 300, byName("Natraj Dining Hall")?.id ?? null),
    ],
  };

  const day2date = addDays(dateDiffFromToday(startDate) + 1);
  const day2: DayPlan = {
    dayNumber: 2,
    date: day2date,
    theme: "Lake Pichola & markets",
    reason: "Lake visits kept to the morning; evening moved indoors because rain is likely.",
    activities: [
      activity("Lake Pichola Boat Ride", "09:30", "10:30", "lake", 400, byName("Lake Pichola Boat Ride")?.id ?? null),
      activity("Millets of Mewar Cafe (lunch)", "12:30", "13:30", "food", 350, byName("Millets of Mewar Cafe")?.id ?? null),
      activity("Hathi Pol Bazaar", "14:00", "15:30", "market", 500, byName("Hathi Pol Bazaar")?.id ?? null),
      activity("Vintage Car Museum", "16:00", "16:45", "museum", 250, byName("Vintage Car Museum")?.id ?? null),
      activity("Natraj Dining Hall (dinner)", "19:30", "20:30", "food", 300, byName("Natraj Dining Hall")?.id ?? null),
    ],
  };

  const day3date = addDays(dateDiffFromToday(startDate) + 2);
  const day3: DayPlan = {
    dayNumber: 3,
    date: day3date,
    theme: "Hilltop views & farewell",
    reason: "A relaxed last day with a sunset point before departure.",
    activities: [
      activity("Sajjangarh Monsoon Palace", "09:00", "10:30", "heritage", 150, byName("Sajjangarh Monsoon Palace")?.id ?? null),
      activity("Natraj Dining Hall (lunch)", "12:30", "13:30", "food", 300, byName("Natraj Dining Hall")?.id ?? null),
      activity("Saheliyon Ki Bari", "15:00", "16:00", "nature", 50, byName("Saheliyon Ki Bari")?.id ?? null),
      activity("Ambrai Ghat Sunset Point", "17:30", "18:15", "lake", 0, byName("Ambrai Ghat Sunset Point")?.id ?? null),
    ],
  };

  const day2WithoutMuseum: DayPlan = {
    ...day2,
    activities: day2.activities.filter((a) => a.title !== "Vintage Car Museum"),
  };

  const versionOne: Itinerary = {
    id: nanoid(10),
    tripId,
    version: 1,
    isCurrent: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    days: [day1, day2WithoutMuseum, day3],
  };

  const versionTwo: Itinerary = {
    id: nanoid(10),
    tripId,
    version: 2,
    isCurrent: true,
    createdAt: new Date().toISOString(),
    days: [day1, day2, day3],
  };

  return [versionOne, versionTwo];
}

function dateDiffFromToday(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

function goaItinerary(tripId: string, startDate: string): Itinerary {
  const places = getPlacesForCity("goa");
  const byName = (n: string) => places.find((p) => p.name === n);
  const offset = dateDiffFromToday(startDate);

  const days: DayPlan[] = [1, 2, 3, 4].map((n) => ({
    dayNumber: n,
    date: addDays(offset + n - 1),
    theme: n === 1 ? "Beach & sunset" : n === 2 ? "Heritage & flea market" : n === 3 ? "Waterfall day trip" : "Nightlife finale",
    reason:
      n === 1
        ? "Eased in with the beach and a shack lunch."
        : n === 2 ? "Old Goa heritage in the morning before the market crowds." : n === 3 ? "A full day out to Dudhsagar, back for a late dinner." : "Last night kept light with shopping before the clubs.",
    activities:
      n === 1
        ? [
            activity("Baga Beach", "09:30", "11:30", "beach", 0, byName("Baga Beach")?.id ?? null),
            activity("Britto's Beach Shack (lunch)", "12:30", "13:45", "food", 700, byName("Britto's Beach Shack")?.id ?? null),
            activity("Calangute Beach", "16:00", "18:00", "beach", 0, byName("Calangute Beach")?.id ?? null),
            activity("Tito's Lane", "21:00", "23:30", "nightlife", 1200, byName("Tito's Lane")?.id ?? null),
          ]
        : n === 2
        ? [
            activity("Basilica of Bom Jesus", "09:00", "10:00", "heritage", 0, byName("Basilica of Bom Jesus")?.id ?? null),
            activity("Vinayak Family Restaurant (lunch)", "12:30", "13:30", "food", 350, byName("Vinayak Family Restaurant")?.id ?? null),
            activity("Anjuna Flea Market", "15:00", "16:30", "market", 500, byName("Anjuna Flea Market")?.id ?? null),
            activity("Curlies Beach Shack (dinner)", "19:30", "21:30", "nightlife", 900, byName("Curlies Beach Shack")?.id ?? null),
          ]
        : n === 3
        ? [
            activity("Dudhsagar Falls", "08:00", "11:00", "nature", 600, byName("Dudhsagar Falls")?.id ?? null),
            activity("Artjuna Cafe (lunch)", "13:00", "14:00", "cafe", 450, byName("Artjuna Cafe")?.id ?? null),
            activity("Thalassa (dinner)", "19:30", "22:00", "nightlife", 1300, byName("Thalassa")?.id ?? null),
          ]
        : [
            activity("Mapusa Market", "10:00", "11:15", "market", 400, byName("Mapusa Market")?.id ?? null),
            activity("Vinayak Family Restaurant (lunch)", "12:30", "13:30", "food", 350, byName("Vinayak Family Restaurant")?.id ?? null),
            activity("Chapora Fort", "16:00", "16:45", "heritage", 0, byName("Chapora Fort")?.id ?? null),
            activity("Tito's Lane (farewell night)", "21:00", "23:45", "nightlife", 1200, byName("Tito's Lane")?.id ?? null),
          ],
  }));

  return {
    id: nanoid(10),
    tripId,
    version: 1,
    isCurrent: true,
    createdAt: new Date().toISOString(),
    days,
  };
}

function jaipurItinerary(tripId: string, startDate: string): Itinerary {
  const places = getPlacesForCity("jaipur");
  const byName = (n: string) => places.find((p) => p.name === n);
  const offset = dateDiffFromToday(startDate);

  const days: DayPlan[] = [1, 2].map((n) => ({
    dayNumber: n,
    date: addDays(offset + n - 1),
    theme: n === 1 ? "Forts & palaces" : "City markets & farewell",
    reason: n === 1 ? "Amber Fort early to avoid the midday heat." : "Shopping morning before the evening train.",
    activities:
      n === 1
        ? [
            activity("Amber Fort", "08:30", "11:00", "heritage", 200, byName("Amber Fort")?.id ?? null),
            activity("Laxmi Mishthan Bhandar (lunch)", "12:30", "13:15", "food", 250, byName("Laxmi Mishthan Bhandar")?.id ?? null),
            activity("Hawa Mahal", "15:00", "15:45", "heritage", 50, byName("Hawa Mahal")?.id ?? null),
            activity("Chokhi Dhani Village (dinner)", "19:00", "21:30", "food", 900, byName("Chokhi Dhani Village")?.id ?? null),
          ]
        : [
            activity("Johari Bazaar", "10:00", "11:30", "market", 700, byName("Johari Bazaar")?.id ?? null),
            activity("Anokhi Cafe (lunch)", "12:30", "13:30", "cafe", 400, byName("Anokhi Cafe")?.id ?? null),
            activity("Albert Hall Museum", "15:00", "16:15", "museum", 150, byName("Albert Hall Museum")?.id ?? null),
          ],
  }));

  return {
    id: nanoid(10),
    tripId,
    version: 1,
    isCurrent: true,
    createdAt: new Date().toISOString(),
    days,
  };
}

export interface SeedData {
  trips: Trip[];
  itineraries: Itinerary[];
  expenses: Expense[];
  memories: TripMemory[];
  commandLogs: AICommandLog[];
}

export function buildSeedData(ownerId: string): SeedData {
  const udaipurTripId = nanoid(10);
  const goaTripId = nanoid(10);
  const jaipurTripId = nanoid(10);
  const manaliTripId = nanoid(10);

  const udaipurStart = addDays(7);
  const udaipurEnd = addDays(9);
  const goaStart = addDays(-1);
  const goaEnd = addDays(2);
  const jaipurStart = addDays(-12);
  const jaipurEnd = addDays(-11);
  const manaliStart = addDays(20);
  const manaliEnd = addDays(24);

  const trips: Trip[] = [
    {
      id: udaipurTripId,
      title: "Udaipur Heritage Getaway",
      destination: "udaipur",
      startDate: udaipurStart,
      endDate: udaipurEnd,
      travelers: 2,
      budget: 24000,
      currency: "INR",
      interests: ["heritage", "food"],
      pace: "moderate",
      status: "PLANNED",
      ownerId,
      createdAt: new Date().toISOString(),
    },
    {
      id: goaTripId,
      title: "Goa Beach Break",
      destination: "goa",
      startDate: goaStart,
      endDate: goaEnd,
      travelers: 3,
      budget: 30000,
      currency: "INR",
      interests: ["beach", "nightlife", "food"],
      pace: "packed",
      status: "ONGOING",
      ownerId,
      createdAt: new Date().toISOString(),
    },
    {
      id: jaipurTripId,
      title: "Jaipur Weekend",
      destination: "jaipur",
      startDate: jaipurStart,
      endDate: jaipurEnd,
      travelers: 2,
      budget: 12000,
      currency: "INR",
      interests: ["heritage", "shopping"],
      pace: "relaxed",
      status: "COMPLETED",
      ownerId,
      createdAt: new Date().toISOString(),
    },
    {
      id: manaliTripId,
      title: "Manali Trip",
      destination: "manali",
      startDate: manaliStart,
      endDate: manaliEnd,
      travelers: 4,
      budget: 40000,
      currency: "INR",
      interests: ["adventure", "nature"],
      pace: "moderate",
      status: "DRAFT",
      ownerId,
      createdAt: new Date().toISOString(),
    },
  ];

  const itineraries: Itinerary[] = [
    ...udaipurItinerary(udaipurTripId, udaipurStart),
    goaItinerary(goaTripId, goaStart),
    jaipurItinerary(jaipurTripId, jaipurStart),
  ];

  const expenses: Expense[] = [
    {
      id: nanoid(8),
      tripId: udaipurTripId,
      amount: 8400,
      currency: "INR",
      amountInTripCurrency: 8400,
      rateUsed: 1,
      category: "Hotel",
      date: new Date().toISOString().slice(0, 10),
      note: "Hotel paid in advance",
    },
    {
      id: nanoid(8),
      tripId: goaTripId,
      amount: 9500,
      currency: "INR",
      amountInTripCurrency: 9500,
      rateUsed: 1,
      category: "Hotel",
      date: goaStart,
      note: "Resort booking",
    },
    {
      id: nanoid(8),
      tripId: goaTripId,
      amount: 6200,
      currency: "INR",
      amountInTripCurrency: 6200,
      rateUsed: 1,
      category: "Food",
      date: goaStart,
      note: "Beach shacks & dinners",
    },
    {
      id: nanoid(8),
      tripId: goaTripId,
      amount: 9800,
      currency: "INR",
      amountInTripCurrency: 9800,
      rateUsed: 1,
      category: "Activities",
      date: addDays(0),
      note: "Dolphin trip + nightlife",
    },
  ];

  const memories: TripMemory[] = [
    {
      id: nanoid(8),
      tripId: udaipurTripId,
      key: "evening-preference",
      value: "Prefers indoor activities on rainy evenings",
      source: "ai",
      updatedAt: new Date().toISOString(),
    },
  ];

  const commandLogs: AICommandLog[] = [
    {
      id: nanoid(8),
      tripId: udaipurTripId,
      text: "What's the weather on day 2?",
      toolsUsed: ["getWeather"],
      status: "ANSWERED",
      reply: "Day 2 in Udaipur looks rainy in the evening (70% chance after 5pm), otherwise warm and sunny.",
      createdAt: new Date().toISOString(),
    },
    {
      id: nanoid(8),
      tripId: udaipurTripId,
      text: "Add a museum stop on day 2 afternoon",
      toolsUsed: ["searchPlaces", "getItinerary"],
      status: "APPLIED",
      reply: "Added Vintage Car Museum to Day 2 afternoon and created version 2.",
      createdAt: new Date().toISOString(),
    },
  ];

  return { trips, itineraries, expenses, memories, commandLogs };
}
