import { DayPlan, Trip } from "@/lib/trips/types";

export interface AgentStep {
  tool: string;
  args: Record<string, unknown>;
  resultSummary: string;
}

export interface GenerateItineraryResult {
  steps: AgentStep[];
  days: DayPlan[];
}

export type CommandOutcome = "APPLIED" | "REJECTED" | "ANSWERED";

export interface AgentCommandResult {
  status: CommandOutcome;
  reply: string;
  steps: AgentStep[];
  updatedDays?: DayPlan[];
  rememberedFact?: { key: string; value: string };
}

/**
 * Behind-an-interface contract so a real LLM-backed agent can replace
 * MockTravelAgent later without the UI changing at all.
 */
export interface TravelAgent {
  generateItinerary(trip: Trip): GenerateItineraryResult;
  handleCommand(trip: Trip, currentDays: DayPlan[], text: string, maxToolCalls: number): AgentCommandResult;
}
