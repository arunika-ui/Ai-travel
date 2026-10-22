import { AppSettings, User } from "@/lib/trips/types";

export const DEMO_USERS: User[] = [
  {
    id: "user-riya",
    name: "Riya Mehta",
    email: "riya@demo.com",
    password: "demo123",
    role: "traveler",
    homeCity: "New Delhi",
    preferences: {
      style: "cultural",
      pace: "relaxed",
      budgetLevel: "mid",
      interests: ["heritage", "food"],
      dietaryNeeds: "Vegetarian",
    },
    active: true,
  },
  {
    id: "user-admin",
    name: "Admin",
    email: "admin@demo.com",
    password: "admin123",
    role: "admin",
    homeCity: "New Delhi",
    preferences: {
      style: "cultural",
      pace: "moderate",
      budgetLevel: "mid",
      interests: ["heritage"],
      dietaryNeeds: "",
    },
    active: true,
  },
  {
    id: "user-arjun",
    name: "Arjun Singh",
    email: "arjun@demo.com",
    password: "demo123",
    role: "traveler",
    homeCity: "Mumbai",
    preferences: {
      style: "adventure",
      pace: "packed",
      budgetLevel: "budget",
      interests: ["adventure", "nature"],
      dietaryNeeds: "",
    },
    active: true,
  },
];

// Defaults match BR-9 in the SRS: 50 AI commands and 5 itinerary
// generations per user per day, both admin-configurable (FR-11.4).
export const DEFAULT_APP_SETTINGS: AppSettings = {
  maxToolCallsPerCommand: 5,
  dailyAICommandLimit: 50,
  dailyItineraryGenerationLimit: 5,
};
