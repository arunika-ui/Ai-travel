"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { DayPlan } from "@/lib/trips/types";

const MapView = dynamic(() => import("@/components/itinerary/MapView").then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
      Loading map...
    </div>
  ),
});

export function MapPanel({ days }: { days: DayPlan[] }) {
  const [selectedDay, setSelectedDay] = useState(days[0]?.dayNumber ?? 1);
  const day = days.find((d) => d.dayNumber === selectedDay) ?? days[0];
  if (!day) return null;

  return (
    <div className="space-y-3">
      <label htmlFor="map-day-select" className="block text-sm font-medium text-slate-700">
        Select day
      </label>
      <select
        id="map-day-select"
        value={day.dayNumber}
        onChange={(e) => setSelectedDay(Number(e.target.value))}
        className="rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      >
        {days.map((d) => (
          <option key={d.dayNumber} value={d.dayNumber}>
            Day {d.dayNumber} — {d.theme}
          </option>
        ))}
      </select>
      <MapView day={day} />
      <p className="text-xs text-slate-500">Map data © OpenStreetMap contributors.</p>
    </div>
  );
}
