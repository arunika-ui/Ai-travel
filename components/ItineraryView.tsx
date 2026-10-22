import { Itinerary } from "@/lib/types";

const CATEGORY_EMOJI: Record<string, string> = {
  food: "🍽️",
  sightseeing: "🏛️",
  nature: "🌳",
  shopping: "🛍️",
  culture: "🎭",
  transport: "🚗",
  other: "📍",
};

export function ItineraryView({ itinerary }: { itinerary: Itinerary }) {
  return (
    <div className="space-y-6">
      {itinerary.notes && (
        <p className="rounded-lg bg-brand-50 p-3 text-sm text-brand-700">{itinerary.notes}</p>
      )}
      {itinerary.days.map((day) => (
        <section
          key={day.day}
          aria-labelledby={`day-${day.day}-heading`}
          className="rounded-xl border border-slate-200 bg-white p-4"
        >
          <h3 id={`day-${day.day}-heading`} className="text-lg font-semibold text-slate-900">
            Day {day.day} · {day.date} — {day.summary}
          </h3>
          <p className="mt-1 text-sm text-slate-600">{day.reason}</p>
          {day.weatherNote && (
            <p className="mt-1 text-sm text-slate-500">☁️ {day.weatherNote}</p>
          )}
          <ol className="mt-4 space-y-3">
            {day.activities.map((activity, idx) => (
              <li
                key={idx}
                className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3"
              >
                <span aria-hidden className="text-xl leading-none">
                  {CATEGORY_EMOJI[activity.category] ?? "📍"}
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-medium text-slate-900">
                      {activity.time}–{activity.endTime} · {activity.title}
                    </span>
                    <span className="text-sm font-medium text-slate-600">
                      ₹{activity.estimatedCostINR.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{activity.description}</p>
                  <p className="mt-1 text-xs text-slate-500">{activity.location.name}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
      <p className="text-right text-sm font-semibold text-slate-700">
        Total estimated cost: ₹{itinerary.totalEstimatedCostINR.toLocaleString("en-IN")}
      </p>
    </div>
  );
}
