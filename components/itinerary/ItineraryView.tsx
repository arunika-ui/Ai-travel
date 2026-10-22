"use client";

import { useState } from "react";
import clsx from "clsx";
import { DayPlan, Trip } from "@/lib/trips/types";
import { DayTimeline } from "@/components/itinerary/DayTimeline";
import { BudgetBar } from "@/components/itinerary/BudgetBar";
import { itineraryTotalCost } from "@/lib/validation/businessRules";

export function ItineraryView({
  trip,
  days,
  readOnly,
  onRegenerateDay,
}: {
  trip: Trip;
  days: DayPlan[];
  readOnly?: boolean;
  onRegenerateDay?: (dayNumber: number) => void;
}) {
  const [selected, setSelected] = useState(days[0]?.dayNumber ?? 1);
  const current = days.find((d) => d.dayNumber === selected) ?? days[0];
  const total = itineraryTotalCost({ id: "", tripId: trip.id, version: 0, isCurrent: true, createdAt: "", days });

  if (!current) return null;

  return (
    <div className="space-y-4">
      <BudgetBar spent={total} budget={trip.budget} />

      <div role="tablist" aria-label="Itinerary days" className="flex flex-wrap gap-2">
        {days.map((d) => (
          <button
            key={d.dayNumber}
            role="tab"
            aria-selected={d.dayNumber === selected}
            onClick={() => setSelected(d.dayNumber)}
            className={clsx(
              "rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
              d.dayNumber === selected ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
          >
            Day {d.dayNumber}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="rounded-xl border border-slate-200 bg-white p-4">
        <DayTimeline
          day={current}
          cityId={trip.destination}
          readOnly={readOnly}
          onRegenerate={onRegenerateDay ? () => onRegenerateDay(current.dayNumber) : undefined}
        />
      </div>
    </div>
  );
}
