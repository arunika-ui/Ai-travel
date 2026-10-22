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
    },
    active: true,
  },
];

export const DEFAULT_APP_SETTINGS: AppSettings = {
  maxToolCallsPerCommand: 5,
  dailyAICommandLimit: 20,
};
