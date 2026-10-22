"use client";

import { useState } from "react";
import { DayPlan, Trip } from "@/lib/trips/types";
import { encodeShare } from "@/lib/trips/share";

export function ShareButton({ trip, days }: { trip: Trip; days: DayPlan[] }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const code = encodeShare(trip, {
      id: "share",
      tripId: trip.id,
      version: 1,
      isCurrent: true,
      createdAt: new Date().toISOString(),
      days,
    });
    const url = `${window.location.origin}/share/${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copy this read-only share link:", url);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      {copied ? "Link copied!" : "Share read-only link"}
    </button>
  );
}
