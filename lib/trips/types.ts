export type TripStatus =
  | "DRAFT"
  | "GENERATING"
  | "FAILED"
  | "PLANNED"
  | "ONGOING"
  | "COMPLETED"
  | "ARCHIVED"
  | "CANCELLED";

export type Pace = "relaxed" | "moderate" | "packed";

export type PlaceCategory =
  | "heritage"
  | "museum"
  | "lake"
  | "beach"
  | "food"
  | "cafe"
  | "market"
  | "adventure"
  | "nature"
  | "temple"
  | "nightlife"
  | "shopping";

export type ExpenseCategory =
  | "Hotel"
  | "Food"
  | "Transport"
  | "Activities"
  | "Shopping"
  | "Other";

export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP" | "AED" | "THB";

export interface Place {
  id: string;
  cityId: string;
  name: string;
  category: PlaceCategory;
  indoor: boolean;
  lat: number;
  lng: number;
  durationMinutes: number;
  costPerPersonINR: number;
  openHour: number; // 24h, e.g. 9
  closeHour: number; // 24h, e.g. 19
  rating: number;
  description: string;
}

export interface Hotel {
  id: string;
  cityId: string;
  name: string;
  lat: number;
  lng: number;
  pricePerNightINR: number;
  rating: number;
}

export interface Destination {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  blurb: string;
}

export type CollaboratorRole = "editor" | "viewer";

export interface Collaborator {
  id: string;
  email: string;
  role: CollaboratorRole;
  invitedAt: string;
}

export interface Trip {
  id: string;
  title: string;
  destination: string; // Destination id
  startDate: string; // ISO yyyy-mm-dd
  endDate: string; // ISO yyyy-mm-dd
  travelers: number;
  budget: number;
  currency: CurrencyCode;
  interests: PlaceCategory[];
  pace: Pace;
  status: TripStatus;
  ownerId: string;
  createdAt: string;
  collaborators?: Collaborator[];
}

export interface Activity {
  id: string;
  title: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  category: PlaceCategory | "transport" | "other";
  estCost: number;
  notes: string;
  placeId: string | null;
  lat?: number;
  lng?: number;
}

export interface DayPlan {
  dayNumber: number;
  date: string;
  theme: string;
  reason: string;
  activities: Activity[];
}

export interface Itinerary {
  id: string;
  tripId: string;
  version: number;
  isCurrent: boolean;
  createdAt: string;
  days: DayPlan[];
}

export interface Expense {
  id: string;
  tripId: string;
  amount: number;
  currency: CurrencyCode;
  amountInTripCurrency: number;
  rateUsed: number;
  category: ExpenseCategory;
  date: string;
  note: string;
}

export interface TripMemory {
  id: string;
  tripId: string;
  key: string;
  value: string;
  source: "user" | "ai";
  updatedAt: string;
}

export type AICommandStatus = "APPLIED" | "REJECTED" | "ANSWERED";

export interface AICommandLog {
  id: string;
  tripId: string;
  text: string;
  toolsUsed: string[];
  status: AICommandStatus;
  reply: string;
  createdAt: string;
  feedback?: "up" | "down";
}

export interface Feedback {
  tripId: string;
  itineraryVersion: number;
  rating: number;
  comment: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "traveler" | "admin";
  homeCity: string;
  preferences: {
    style: string;
    pace: Pace;
    budgetLevel: "budget" | "mid" | "luxury";
    interests: PlaceCategory[];
    dietaryNeeds: string;
  };
  active: boolean;
}

export interface AppSettings {
  maxToolCallsPerCommand: number;
  dailyAICommandLimit: number;
  dailyItineraryGenerationLimit: number;
}

export interface PlaceReport {
  id: string;
  placeId: string;
  placeName: string;
  tripId: string;
  note: string;
  createdAt: string;
}

export interface AdminAuditEntry {
  id: string;
  adminId: string;
  action: string;
  detail: string;
  createdAt: string;
}
