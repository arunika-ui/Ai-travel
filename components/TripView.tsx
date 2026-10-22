"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { ChatMessage, Itinerary, ItineraryVersion, Trip } from "@/lib/types";
import { tripRepository } from "@/lib/storage/tripRepository";
import { ItineraryView } from "@/components/ItineraryView";
import { MapPanel } from "@/components/MapPanel";
import { ExpensesTab } from "@/components/ExpensesTab";
import { ChatPanel } from "@/components/ChatPanel";
import { ShareButton } from "@/components/ShareButton";

type Tab = "itinerary" | "map" | "expenses" | "chat";

export function TripView({ tripId }: { tripId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState<Tab>("itinerary");
  const [generating, setGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const startedGeneration = useRef(false);

  useEffect(() => {
    tripRepository.get(tripId).then((t) => {
      if (!t) {
        setNotFound(true);
        return;
      }
      setTrip(t);
    });
  }, [tripId]);

  useEffect(() => {
    if (!trip || startedGeneration.current) return;
    const shouldGenerate = searchParams.get("generate") === "1" && trip.versions.length === 0;
    if (!shouldGenerate) return;
    startedGeneration.current = true;
    void generateItinerary(trip);
  }, [trip, searchParams]);

  async function persist(updated: Trip) {
    updated.updatedAt = new Date().toISOString();
    await tripRepository.save(updated);
    setTrip({ ...updated });
  }

  async function generateItinerary(currentTrip: Trip) {
    setGenerating(true);
    setGenError(null);
    setStatusMessage("Starting...");

    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentTrip.input),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Failed to generate itinerary.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const raw of events) {
          const lines = raw.split("\n");
          const eventLine = lines.find((l) => l.startsWith("event:"));
          const dataLine = lines.find((l) => l.startsWith("data:"));
          if (!eventLine || !dataLine) continue;
          const eventName = eventLine.replace("event:", "").trim();
          const data = JSON.parse(dataLine.replace("data:", "").trim());

          if (eventName === "status") {
            setStatusMessage(data.message);
          } else if (eventName === "itinerary") {
            const version: ItineraryVersion = {
              version: 1,
              createdAt: new Date().toISOString(),
              itinerary: data.itinerary as Itinerary,
            };
            const updated: Trip = {
              ...currentTrip,
              versions: [version],
              currentVersion: 0,
            };
            await persist(updated);
          } else if (eventName === "error") {
            throw new Error(data.message);
          }
        }
      }
    } catch (err: any) {
      setGenError(err?.message ?? "Failed to generate itinerary.");
    } finally {
      setGenerating(false);
      setStatusMessage(null);
    }
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center">
        <p className="text-lg text-slate-700">Trip not found in this browser.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-white"
        >
          Create a new trip
        </button>
      </div>
    );
  }

  if (!trip) {
    return <div className="mx-auto max-w-2xl p-6 text-center text-slate-500">Loading trip...</div>;
  }

  const currentItinerary = trip.versions[trip.currentVersion]?.itinerary ?? null;

  const handleChatUpdate = (messages: ChatMessage[]) => {
    persist({ ...trip, chat: messages });
  };

  const handleNewVersion = (partial: ItineraryVersion) => {
    const nextVersions = [...trip.versions, { ...partial, version: trip.versions.length + 1 }];
    persist({ ...trip, versions: nextVersions, currentVersion: nextVersions.length - 1 });
  };

  const handleUndo = () => {
    if (trip.currentVersion <= 0) return;
    persist({ ...trip, currentVersion: trip.currentVersion - 1 });
  };

  const handleExpensesChange = (expenses: Trip["expenses"]) => {
    persist({ ...trip, expenses });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{trip.input.destination}</h1>
          <p className="text-sm text-slate-600">
            {trip.input.startDate} to {trip.input.endDate} · {trip.input.travelers} traveler(s) ·
            Budget ₹{trip.input.budgetINR.toLocaleString("en-IN")}
          </p>
        </div>
        <ShareButton trip={trip} />
      </div>

      {generating && (
        <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 p-4" role="status">
          <p className="font-medium text-brand-800">{statusMessage ?? "Generating itinerary..."}</p>
        </div>
      )}

      {genError && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4" role="alert">
          <p className="font-medium text-red-800">{genError}</p>
          <button
            onClick={() => generateItinerary(trip)}
            className="mt-2 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white"
          >
            Retry
          </button>
        </div>
      )}

      {currentItinerary && !generating && (
        <>
          <div className="mt-6 border-b border-slate-200">
            <nav className="flex gap-1" aria-label="Trip sections" role="tablist">
              {([
                ["itinerary", "Itinerary"],
                ["map", "Map"],
                ["expenses", "Expenses"],
                ["chat", "AI Chat"],
              ] as [Tab, string][]).map(([key, label]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => setTab(key)}
                  className={clsx(
                    "rounded-t-lg px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                    tab === key
                      ? "border-b-2 border-brand-600 text-brand-700"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-4" role="tabpanel">
            {trip.versions.length > 1 && (
              <p className="mb-3 text-xs text-slate-500">
                Version {trip.currentVersion + 1} of {trip.versions.length}
                {trip.versions[trip.currentVersion]?.changeSummary &&
                  ` — ${trip.versions[trip.currentVersion].changeSummary}`}
              </p>
            )}
            {tab === "itinerary" && <ItineraryView itinerary={currentItinerary} />}
            {tab === "map" && <MapPanel itinerary={currentItinerary} />}
            {tab === "expenses" && (
              <ExpensesTab
                expenses={trip.expenses}
                budgetINR={trip.input.budgetINR}
                onChange={handleExpensesChange}
              />
            )}
            {tab === "chat" && (
              <ChatPanel
                input={trip.input}
                chat={trip.chat}
                currentItinerary={currentItinerary}
                canUndo={trip.currentVersion > 0}
                onChatUpdate={handleChatUpdate}
                onNewVersion={handleNewVersion}
                onUndo={handleUndo}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
