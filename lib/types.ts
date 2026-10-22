export type Pace = "relaxed" | "moderate" | "packed";

export interface TripInput {
  destination: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string; // ISO yyyy-mm-dd
  travelers: number;
  budgetINR: number;
  interests: string[];
  pace: Pace;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Activity {
  time: string; // HH:MM
  endTime: string; // HH:MM
  title: string;
  description: string;
  category: string;
  location: {
    name: string;
    lat: number | null;
    lng: number | null;
  };
  estimatedCostINR: number;
}

export interface DayPlan {
  day: number;
  date: string;
  summary: string;
  reason: string;
  weatherNote?: string;
  activities: Activity[];
}

export interface Itinerary {
  days: DayPlan[];
  totalEstimatedCostINR: number;
  notes?: string;
}

export interface ItineraryVersion {
  version: number;
  createdAt: string;
  itinerary: Itinerary;
  changeSummary?: string;
}

export interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: string;
  note?: string;
  date: string;
  amountINR: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface Trip {
  id: string;
  shareCode: string;
  input: TripInput;
  versions: ItineraryVersion[];
  currentVersion: number;
  expenses: Expense[];
  chat: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export const INTERESTS = [
  "Food",
  "History",
  "Nature",
  "Adventure",
  "Shopping",
  "Art & Culture",
  "Nightlife",
  "Relaxation",
  "Photography",
  "Family",
] as const;
