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
import { ExpensesTab } from "@/components/expenses/ExpensesTab";
import { PlacesSearch } from "@/components/places/PlacesSearch";
import { ShareButton } from "@/components/trip/ShareButton";
import { FeedbackPanel } from "@/components/trip/FeedbackPanel";
import { CollaboratorsPanel } from "@/components/trip/CollaboratorsPanel";
import { JournalTab } from "@/components/journal/JournalTab";
import { PackingTab } from "@/components/journal/PackingTab";
import { AgentStep } from "@/lib/ai/TravelAgent";
import { deleteTrip, duplicateTrip } from "@/lib/trips/tripLifecycle";
import { getCurrentUser } from "@/lib/trips/auth";
import { getGenerationCountToday, incrementGenerationCountToday } from "@/lib/trips/usageLimits";
import { getSettings } from "@/lib/trips/settings";
import { getWeatherForecast } from "@/lib/mock-data/weather";

type Tab = "itinerary" | "map" | "expenses" | "chat" | "memory" | "history" | "journal" | "packing";

export function TripWorkspace({ tripId }: { tripId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [trip, setTrip] = useState<Trip | null | undefined>(undefined);
  const [days, setDays] = useState<DayPlan[] | null>(null);
  const [tab, setTab] = useState<Tab>("itinerary");
  const [generating, setGenerating] = useState(false);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [generationLimitReached, setGenerationLimitReached] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [weatherWarningDismissed, setWeatherWarningDismissed] = useState(false);
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
    const user = getCurrentUser();
    if (user) {
      const settings = getSettings();
      if (getGenerationCountToday(user.id) >= settings.dailyItineraryGenerationLimit) {
        setGenerationLimitReached(true);
        return;
      }
      incrementGenerationCountToday(user.id);
    }

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

  async function handleDeleteTrip() {
    deleteTrip(tripId);
    router.push("/dashboard");
  }

  async function handleDuplicateTrip() {
    if (!trip) return;
    const copy = duplicateTrip(trip);
    router.push(`/trips/${copy.id}`);
  }

  function handleCollaboratorsUpdated(updated: Trip) {
    setTrip(updated);
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

  const todayForecast =
    status === "ONGOING" && !weatherWarningDismissed ? getWeatherForecast(trip.destination, new Date().toISOString().slice(0, 10)) : null;
  const showWeatherWarning =
    todayForecast && (todayForecast.condition === "Thunderstorm" || todayForecast.rainChance >= 70 || todayForecast.tempC >= 38);

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
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Badge>
          {days && <ShareButton trip={trip} days={days} />}
          {!readOnly && <CollaboratorsPanel trip={trip} onUpdated={handleCollaboratorsUpdated} />}
          {!readOnly && (
            <button
              onClick={() => router.push(`/trips/${trip.id}/edit`)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Edit trip
            </button>
          )}
          <button
            onClick={handleDuplicateTrip}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            Duplicate
          </button>
          {canCancel(trip) && (
            <button
              onClick={handleCancelTrip}
              className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              Cancel trip
            </button>
          )}
          {!confirmingDelete ? (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              Delete
            </button>
          ) : (
            <span className="flex items-center gap-1 text-sm">
              <button onClick={handleDeleteTrip} className="rounded-lg bg-red-600 px-3 py-1.5 font-semibold text-white">
                Confirm delete
              </button>
              <button onClick={() => setConfirmingDelete(false)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700">
                Cancel
              </button>
            </span>
          )}
        </div>
      </div>

      {showWeatherWarning && todayForecast && (
        <div className="mt-4 flex items-center justify-between gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <span>
            Weather update: today looks like {todayForecast.condition.toLowerCase()}
            {todayForecast.tempC >= 38 ? ` and hot (${todayForecast.tempC}°C)` : ""}. Consider adjusting today&apos;s plan in AI Chat.
          </span>
          <button onClick={() => setWeatherWarningDismissed(true)} className="font-medium underline">
            Dismiss
          </button>
        </div>
      )}

      {generationLimitReached && (
        <div role="alert" className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          You&apos;ve reached today&apos;s itinerary generation limit for this demo (BR-9). Try
          again tomorrow, or raise the limit in Admin settings.
        </div>
      )}

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
            {tab === "map" && (
              <div className="space-y-4">
                <MapPanel days={days} />
                {!readOnly && <PlacesSearch trip={trip} days={days} onDaysUpdated={handleDaysUpdated} />}
              </div>
            )}
            {tab === "expenses" && !readOnly && <ExpensesTab trip={trip} />}
            {tab === "chat" && !readOnly && <ChatPanel trip={trip} days={days} onDaysUpdated={handleDaysUpdated} />}
            {tab === "memory" && !readOnly && <MemoryPanel tripId={trip.id} />}
            {tab === "history" && !readOnly && <CommandHistory tripId={trip.id} />}
            {tab === "journal" && <JournalTab trip={trip} days={days} readOnly={readOnly} />}
            {tab === "packing" && <PackingTab trip={trip} readOnly={readOnly} />}
          </div>

          {readOnly && status === "COMPLETED" && (
            <div className="mt-4">
              <FeedbackPanel trip={trip} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function tabList(readOnly: boolean): [Tab, string][] {
  const base: [Tab, string][] = [
    ["itinerary", "Itinerary"],
    ["map", "Map"],
    ["journal", "Journal"],
    ["packing", "Packing"],
  ];
  if (readOnly) return base;
  return [...base, ["expenses", "Expenses"], ["chat", "AI Chat"], ["memory", "Memory"], ["history", "History"]];
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
