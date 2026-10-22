"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { Trip, DayPlan } from "@/lib/trips/types";
import { tripRepository } from "@/lib/data/TripRepository";
import { getCurrentItinerary, saveNewVersion } from "@/lib/trips/itinerary";
import { mockTravelAgent } from "@/lib/ai/MockTravelAgent";
import { getEffectiveStatus, STATUS_COLORS, STATUS_LABELS } from "@/lib/trips/status";
import { canCancel, isReadOnly } from "@/lib/validation/businessRules";
import { getDestination } from "@/lib/mock-data/destinations";
import { Badge } from "@/components/ui/Badge";
import { GenerationProgress } from "@/components/trip/GenerationProgress";
import { ItineraryView } from "@/components/itinerary/ItineraryView";
import { MapPanel } from "@/components/itinerary/MapPanel";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { MemoryPanel } from "@/components/chat/MemoryPanel";
import { CommandHistory } from "@/components/chat/CommandHistory";
import { AgentStep } from "@/lib/ai/TravelAgent";

type Tab = "itinerary" | "map" | "chat" | "memory" | "history";

export function TripWorkspace({ tripId }: { tripId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [trip, setTrip] = useState<Trip | null | undefined>(undefined);
  const [days, setDays] = useState<DayPlan[] | null>(null);
  const [tab, setTab] = useState<Tab>("itinerary");
  const [generating, setGenerating] = useState(false);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const triggeredAuto = useRef(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    load();
  }, [tripId]);

  async function load() {
    const t = await tripRepository.get(tripId);
    setTrip(t);
    if (t) {
      const itinerary = getCurrentItinerary(t.id);
      setDays(itinerary?.days ?? null);
    }
  }

  useEffect(() => {
    if (!trip || days || triggeredAuto.current) return;
    if (trip.status === "DRAFT" && searchParams.get("generate") === "1") {
      triggeredAuto.current = true;
      void handleGenerate(trip);
    }
  }, [trip, days, searchParams]);

  async function handleGenerate(targetTrip: Trip) {
    setGenerating(true);
    setSteps([]);
    await tripRepository.save({ ...targetTrip, status: "GENERATING" });

    const { steps: agentSteps, days: newDays } = mockTravelAgent.generateItinerary(targetTrip);
    for (const step of agentSteps) {
      await delay(700);
      setSteps((prev) => [...prev, step]);
    }
    await delay(500);

    saveNewVersion(targetTrip.id, newDays);
    const updatedTrip: Trip = { ...targetTrip, status: "PLANNED" };
    await tripRepository.save(updatedTrip);
    setTrip(updatedTrip);
    setDays(newDays);
    setGenerating(false);
  }

  async function handleRegenerateDay(dayNumber: number) {
    if (!trip || !days) return;
    const { regenerateDay } = await import("@/lib/ai/generateItinerary");
    const newDay = regenerateDay(trip, days, dayNumber);
    const updatedDays = days.map((d) => (d.dayNumber === dayNumber ? newDay : d));
    saveNewVersion(trip.id, updatedDays);
    setDays(updatedDays);
  }

  async function handleCancelTrip() {
    if (!trip) return;
    const updated: Trip = { ...trip, status: "CANCELLED" };
    await tripRepository.save(updated);
    setTrip(updated);
  }

  function handleDaysUpdated(newDays: DayPlan[]) {
    setDays(newDays);
  }

  if (trip === undefined) {
    return <div className="mx-auto max-w-2xl px-4 py-10 text-center text-slate-500">Loading trip...</div>;
  }
  if (!trip) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center">
        <p className="text-slate-700">Trip not found.</p>
        <button onClick={() => router.push("/dashboard")} className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-white">
          Back to dashboard
        </button>
      </div>
    );
  }

  const status = getEffectiveStatus(trip);
  const destination = getDestination(trip.destination);
  const readOnly = isReadOnly(status);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{trip.title}</h1>
          <p className="text-sm text-slate-600">
            {destination?.name ?? trip.destination} · {trip.startDate} to {trip.endDate} · {trip.travelers} traveler(s) · Budget ₹
            {trip.budget.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Badge>
          {canCancel(trip) && (
            <button
              onClick={handleCancelTrip}
              className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              Cancel trip
            </button>
          )}
        </div>
      </div>

      {(generating || trip.status === "GENERATING") && <div className="mt-6"><GenerationProgress steps={steps} active={generating} /></div>}

      {!days && !generating && trip.status !== "GENERATING" && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-slate-700">This trip doesn&apos;t have an itinerary yet.</p>
          <button
            onClick={() => handleGenerate(trip)}
            className="mt-3 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            Generate itinerary
          </button>
        </div>
      )}

      {days && !generating && (
        <>
          <div className="mt-6 border-b border-slate-200">
            <nav className="flex flex-wrap gap-1" aria-label="Trip sections" role="tablist">
              {tabList(readOnly).map(([key, label]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => setTab(key)}
                  className={clsx(
                    "rounded-t-lg px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                    tab === key ? "border-b-2 border-brand-600 text-brand-700" : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-4" role="tabpanel">
            {tab === "itinerary" && (
              <ItineraryView trip={trip} days={days} readOnly={readOnly} onRegenerateDay={readOnly ? undefined : handleRegenerateDay} />
            )}
            {tab === "map" && <MapPanel days={days} />}
            {tab === "chat" && !readOnly && <ChatPanel trip={trip} days={days} onDaysUpdated={handleDaysUpdated} />}
            {tab === "memory" && !readOnly && <MemoryPanel tripId={trip.id} />}
            {tab === "history" && !readOnly && <CommandHistory tripId={trip.id} />}
          </div>
        </>
      )}
    </div>
  );
}

function tabList(readOnly: boolean): [Tab, string][] {
  const base: [Tab, string][] = [
    ["itinerary", "Itinerary"],
    ["map", "Map"],
  ];
  if (readOnly) return base;
  return [...base, ["chat", "AI Chat"], ["memory", "Memory"], ["history", "History"]];
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
