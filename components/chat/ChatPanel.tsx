"use client";

import { useState } from "react";
import { DayPlan, Trip } from "@/lib/trips/types";
import { mockTravelAgent } from "@/lib/ai/MockTravelAgent";
import { EXAMPLE_COMMANDS } from "@/lib/ai/intentParser";
import { AgentStep } from "@/lib/ai/TravelAgent";
import { saveNewVersion, restoreVersion, listItineraryVersions } from "@/lib/trips/itinerary";
import { logCommand, getCommandCountToday, incrementCommandCountToday, setCommandFeedback } from "@/lib/trips/commandLog";
import { rememberFact } from "@/lib/trips/memory";
import { getSettings } from "@/lib/trips/settings";
import { getCurrentUser } from "@/lib/trips/auth";

interface ChatEntry {
  id: string;
  role: "user" | "agent";
  text: string;
  steps?: AgentStep[];
  status?: "APPLIED" | "REJECTED" | "ANSWERED";
  canUndo?: boolean;
  logId?: string;
}

export function ChatPanel({
  trip,
  days,
  onDaysUpdated,
}: {
  trip: Trip;
  days: DayPlan[];
  onDaysUpdated: (days: DayPlan[]) => void;
}) {
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [rememberedChip, setRememberedChip] = useState<string | null>(null);

  async function runCommand(command: string) {
    const trimmed = command.trim();
    if (!trimmed || loading) return;

    const user = getCurrentUser();
    const settings = getSettings();
    if (user) {
      const countToday = getCommandCountToday(user.id);
      if (countToday >= settings.dailyAICommandLimit) {
        setLimitReached(true);
        return;
      }
    }

    setText("");
    setEntries((prev) => [...prev, { id: `${Date.now()}-u`, role: "user", text: trimmed }]);
    setLoading(true);

    await delay(300); // small pause so the step list feels like it's "thinking"
    const result = mockTravelAgent.handleCommand(trip, days, trimmed, settings.maxToolCallsPerCommand);
    if (user) incrementCommandCountToday(user.id);

    let previousVersionNumber: number | null = null;
    if (result.status === "APPLIED" && result.updatedDays) {
      const versions = listItineraryVersions(trip.id);
      previousVersionNumber = versions[versions.length - 1]?.version ?? null;
      saveNewVersion(trip.id, result.updatedDays);
      onDaysUpdated(result.updatedDays);
    }

    if (result.rememberedFact) {
      rememberFact(trip.id, result.rememberedFact.key, result.rememberedFact.value, "ai");
      setRememberedChip(result.rememberedFact.value);
      setTimeout(() => setRememberedChip(null), 4000);
    }

    const log = logCommand(trip.id, trimmed, result.steps.map((s) => s.tool), result.status, result.reply);

    setEntries((prev) => [
      ...prev,
      {
        id: `${Date.now()}-a`,
        role: "agent",
        text: result.reply,
        steps: result.steps,
        status: result.status,
        canUndo: result.status === "APPLIED" && previousVersionNumber !== null,
        logId: log.id,
      },
    ]);
    setLoading(false);
  }

  function handleUndo(entryIdx: number) {
    const versions = listItineraryVersions(trip.id);
    if (versions.length < 2) return;
    const previous = versions[versions.length - 2];
    restoreVersion(trip.id, previous.version);
    onDaysUpdated(previous.days);
    setEntries((prev) =>
      prev.map((e, i) => (i === entryIdx ? { ...e, canUndo: false, text: `${e.text} (undone)` } : e))
    );
  }

  function handleFeedback(entry: ChatEntry, feedback: "up" | "down") {
    if (!entry.logId) return;
    setCommandFeedback(entry.logId, feedback);
    setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, text: e.text } : e)));
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
        <p className="text-sm font-semibold text-slate-900">AI Chat</p>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
          Demo mode: simulated AI
        </span>
      </div>

      {rememberedChip && (
        <div className="border-b border-slate-100 bg-brand-50 px-4 py-2 text-xs text-brand-700">
          💾 Remembered: {rememberedChip}
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite" style={{ maxHeight: 420, minHeight: 240 }}>
        {entries.length === 0 && (
          <div>
            <p className="text-sm text-slate-500">Try one of these, or type your own:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLE_COMMANDS.slice(0, 6).map((cmd) => (
                <button
                  key={cmd}
                  type="button"
                  onClick={() => runCommand(cmd)}
                  className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 hover:border-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        )}

        {entries.map((entry, idx) => (
          <div key={entry.id} className={entry.role === "user" ? "ml-auto max-w-[85%]" : "mr-auto max-w-[90%]"}>
            {entry.role === "user" ? (
              <div className="rounded-lg bg-brand-600 px-3 py-2 text-sm text-white">{entry.text}</div>
            ) : (
              <div className="space-y-1">
                {entry.steps && entry.steps.length > 0 && (
                  <ul className="space-y-0.5 text-xs text-slate-500">
                    {entry.steps.map((s, i) => (
                      <li key={i}>
                        🔧 {s.tool}({Object.values(s.args).filter(Boolean).join(", ")}) → {s.resultSummary}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-800">{entry.text}</div>
                <div className="flex items-center gap-3">
                  {entry.canUndo && (
                    <button
                      type="button"
                      onClick={() => handleUndo(idx)}
                      className="text-xs font-semibold text-brand-700 underline hover:text-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      Undo
                    </button>
                  )}
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <button
                      type="button"
                      aria-label="Good reply"
                      onClick={() => handleFeedback(entry, "up")}
                      className="rounded px-1 hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      👍
                    </button>
                    <button
                      type="button"
                      aria-label="Bad reply"
                      onClick={() => handleFeedback(entry, "down")}
                      className="rounded px-1 hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      👎
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {loading && <p className="text-sm text-slate-500">Thinking…</p>}
        {limitReached && (
          <p role="alert" className="text-sm text-red-600">
            You&apos;ve reached today&apos;s AI command limit for this demo. Try again tomorrow, or raise the
            limit in Admin settings.
          </p>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          runCommand(text);
        }}
        className="flex gap-2 border-t border-slate-200 p-3"
      >
        <label htmlFor="chat-input" className="sr-only">
          Message the AI travel companion
        </label>
        <input
          id="chat-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Day 2 evening may rain, swap to something indoor"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </div>
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
