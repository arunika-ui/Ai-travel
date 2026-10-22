"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import { ChatMessage, Itinerary, ItineraryVersion, TripInput } from "@/lib/types";

export function ChatPanel({
  input,
  chat,
  currentItinerary,
  canUndo,
  onChatUpdate,
  onNewVersion,
  onUndo,
}: {
  input: TripInput;
  chat: ChatMessage[];
  currentItinerary: Itinerary;
  canUndo: boolean;
  onChatUpdate: (messages: ChatMessage[]) => void;
  onNewVersion: (version: ItineraryVersion) => void;
  onUndo: () => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSummary, setLastSummary] = useState<string | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || loading) return;
    setError(null);
    setLastSummary(null);

    const userMessage: ChatMessage = {
      id: nanoid(8),
      role: "user",
      content: text.trim(),
      createdAt: new Date().toISOString(),
    };
    const nextChat = [...chat, userMessage];
    onChatUpdate(nextChat);
    setText("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          itinerary: currentItinerary,
          input,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to update itinerary.");
      }

      const assistantMessage: ChatMessage = {
        id: nanoid(8),
        role: "assistant",
        content: data.changeSummary,
        createdAt: new Date().toISOString(),
      };
      onChatUpdate([...nextChat, assistantMessage]);
      setLastSummary(data.changeSummary);
      onNewVersion({
        version: 0, // caller assigns actual version number
        createdAt: new Date().toISOString(),
        itinerary: data.itinerary,
        changeSummary: data.changeSummary,
      });
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white">
      <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite" style={{ maxHeight: 360 }}>
        {chat.length === 0 && (
          <p className="text-sm text-slate-500">
            Try: &ldquo;Day 2 evening may rain, swap to something indoor&rdquo; or &ldquo;Add
            more food experiences on day 1&rdquo;.
          </p>
        )}
        {chat.map((m) => (
          <div
            key={m.id}
            className={
              m.role === "user"
                ? "ml-auto max-w-[85%] rounded-lg bg-brand-600 px-3 py-2 text-sm text-white"
                : "mr-auto max-w-[85%] rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-800"
            }
          >
            {m.content}
          </div>
        ))}
        {loading && <p className="text-sm text-slate-500">Updating itinerary…</p>}
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      {lastSummary && canUndo && (
        <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-amber-50 px-4 py-2 text-sm">
          <span className="text-amber-800">Itinerary updated.</span>
          <button
            type="button"
            onClick={() => {
              onUndo();
              setLastSummary(null);
            }}
            className="rounded px-2 py-1 font-semibold text-amber-900 underline hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            Undo
          </button>
        </div>
      )}

      <form onSubmit={handleSend} className="flex gap-2 border-t border-slate-200 p-3">
        <label htmlFor="chat-input" className="sr-only">
          Message the AI travel companion
        </label>
        <input
          id="chat-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask to change your itinerary..."
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
