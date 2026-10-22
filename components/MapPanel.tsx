"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Itinerary } from "@/lib/types";

const MapView = dynamic(() => import("@/components/MapView").then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
      Loading map...
    </div>
  ),
});

export function MapPanel({ itinerary }: { itinerary: Itinerary }) {
  const [selectedDay, setSelectedDay] = useState(1);
  const day = itinerary.days.find((d) => d.day === selectedDay) ?? itinerary.days[0];

  return (
    <div className="space-y-3">
      <label htmlFor="map-day-select" className="block text-sm font-medium text-slate-700">
        Select day
      </label>
      <select
        id="map-day-select"
        value={day.day}
        onChange={(e) => setSelectedDay(Number(e.target.value))}
        className="rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      >
        {itinerary.days.map((d) => (
          <option key={d.day} value={d.day}>
            Day {d.day} — {d.summary}
          </option>
        ))}
      </select>
      <MapView day={day} />
    </div>
  );
}
