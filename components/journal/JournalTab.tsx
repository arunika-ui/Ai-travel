"use client";

import { useEffect, useState } from "react";
import { DayPlan, Mood, Trip } from "@/lib/trips/types";
import { getJournalEntry, listJournalEntries, saveJournalEntry, deleteJournalPhoto } from "@/lib/trips/journal";
import { resizeImageFile } from "@/lib/trips/imageUtils";
import { StorageQuotaError } from "@/lib/data/localDb";
import { renderPostcard, downloadDataUrl } from "@/lib/trips/postcard";

const MOODS: { value: Mood; emoji: string; label: string }[] = [
  { value: "amazing", emoji: "🤩", label: "Amazing" },
  { value: "good", emoji: "🙂", label: "Good" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "tired", emoji: "😴", label: "Tired" },
  { value: "rainy", emoji: "🌧️", label: "Rained out" },
];

export function JournalTab({ trip, days, readOnly }: { trip: Trip; days: DayPlan[]; readOnly?: boolean }) {
  const [selectedDay, setSelectedDay] = useState(days[0]?.dayNumber ?? 1);
  const [note, setNote] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generatingPostcard, setGeneratingPostcard] = useState(false);

  useEffect(() => {
    const entry = getJournalEntry(trip.id, selectedDay);
    setNote(entry?.note ?? "");
    setMood(entry?.mood ?? null);
    setPhoto(entry?.photoDataUrl ?? null);
    setSaved(false);
    setError(null);
  }, [trip.id, selectedDay]);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const dataUrl = await resizeImageFile(file);
      setPhoto(dataUrl);
    } catch (err: any) {
      setError(err?.message ?? "Could not add that photo.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function handleSave() {
    setError(null);
    try {
      saveJournalEntry(trip.id, selectedDay, { note, mood, photoDataUrl: photo });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof StorageQuotaError ? err.message : "Could not save that entry.");
    }
  }

  function handleRemovePhoto() {
    setPhoto(null);
    deleteJournalPhoto(trip.id, selectedDay);
  }

  async function handlePostcard() {
    setGeneratingPostcard(true);
    try {
      const dataUrl = await renderPostcard(trip, photo);
      downloadDataUrl(dataUrl, `${trip.title.replace(/\s+/g, "-").toLowerCase()}-postcard.png`);
    } catch (err: any) {
      setError(err?.message ?? "Could not generate the postcard.");
    } finally {
      setGeneratingPostcard(false);
    }
  }

  const entries = listJournalEntries(trip.id);
  const hasEntryByDay = new Set(entries.map((e) => e.dayNumber));

  return (
    <div className="space-y-4">
      <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
        Your private journal — notes and photos here stay only in this browser, never uploaded
        anywhere.
      </p>

      <div role="tablist" aria-label="Journal days" className="flex flex-wrap gap-2">
        {days.map((d) => (
          <button
            key={d.dayNumber}
            role="tab"
            aria-selected={d.dayNumber === selectedDay}
            onClick={() => setSelectedDay(d.dayNumber)}
            className={
              d.dayNumber === selectedDay
                ? "rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white"
                : "rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
            }
          >
            Day {d.dayNumber} {hasEntryByDay.has(d.dayNumber) ? "✓" : ""}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <fieldset disabled={readOnly}>
          <legend className="block text-sm font-medium text-slate-700">How did Day {selectedDay} feel?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(mood === m.value ? null : m.value)}
                aria-pressed={mood === m.value}
                className={
                  mood === m.value
                    ? "rounded-full border border-brand-600 bg-brand-600 px-3 py-1.5 text-sm text-white"
                    : "rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-brand-400"
                }
              >
                {m.emoji} {m.label}
              </button>
            ))}
          </div>

          <label htmlFor="journal-note" className="mt-4 block text-sm font-medium text-slate-700">
            Notes
          </label>
          <textarea
            id="journal-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="What happened today?"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />

          <div className="mt-4">
            <label htmlFor="journal-photo" className="block text-sm font-medium text-slate-700">
              Photo
            </label>
            {photo ? (
              <div className="mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- local data URL, not an optimizable remote image */}
                <img src={photo} alt={`Day ${selectedDay} journal photo`} className="h-40 w-full rounded-lg object-cover" />
                {!readOnly && (
                  <button onClick={handleRemovePhoto} className="mt-1 text-xs font-medium text-red-600 underline">
                    Remove photo
                  </button>
                )}
              </div>
            ) : (
              !readOnly && (
                <input
                  id="journal-photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="mt-1 text-sm"
                />
              )
            )}
            {uploading && <p className="mt-1 text-xs text-slate-500">Resizing photo…</p>}
          </div>

          {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}

          {!readOnly && (
            <button
              onClick={handleSave}
              className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Save entry
            </button>
          )}
          {saved && <p role="status" className="mt-2 text-sm text-green-600">Saved.</p>}
        </fieldset>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
        <p className="text-sm text-slate-600">
          Turn this trip into a shareable postcard — uses today&apos;s journal photo if you added
          one, otherwise generates art from your destination.
        </p>
        <button
          onClick={handlePostcard}
          disabled={generatingPostcard}
          className="mt-3 rounded-lg border border-brand-300 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100 disabled:opacity-60"
        >
          {generatingPostcard ? "Generating…" : "Download trip postcard"}
        </button>
      </div>
    </div>
  );
}
