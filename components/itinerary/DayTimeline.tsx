import { DayPlan } from "@/lib/trips/types";
import { getWeatherForecast } from "@/lib/mock-data/weather";

const CATEGORY_EMOJI: Record<string, string> = {
  heritage: "🏛️", museum: "🖼️", lake: "🚤", beach: "🏖️", food: "🍽️", cafe: "☕",
  market: "🛍️", adventure: "🧗", nature: "🌳", temple: "🛕", nightlife: "🎶", shopping: "🛒",
  transport: "🚗", other: "📍",
};

export function DayTimeline({
  day,
  cityId,
  onRegenerate,
  readOnly,
}: {
  day: DayPlan;
  cityId: string;
  onRegenerate?: () => void;
  readOnly?: boolean;
}) {
  const weather = getWeatherForecast(cityId, day.date);
  const dayCost = day.activities.reduce((sum, a) => sum + a.estCost, 0);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Day {day.dayNumber} · {day.date} — {day.theme}
          </h3>
          <p className="mt-1 text-sm text-slate-600">{day.reason}</p>
        </div>
        {!readOnly && onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            Regenerate this day
          </button>
        )}
      </div>

      <p className="mt-2 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600" aria-label="Weather forecast">
        <span aria-hidden>☁️</span>
        {weather.condition}, {weather.tempC}°C · Evening rain chance {weather.eveningRainChance}%
      </p>

      <ol className="mt-4 space-y-3">
        {day.activities.map((activity) => (
          <li key={activity.id} className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
            <span aria-hidden className="text-xl leading-none">
              {CATEGORY_EMOJI[activity.category] ?? "📍"}
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium text-slate-900">
                  {activity.startTime}–{activity.endTime} · {activity.title}
                </span>
                <span className="text-sm font-medium text-slate-600">₹{activity.estCost.toLocaleString("en-IN")}</span>
              </div>
              {activity.notes && <p className="mt-1 text-sm text-slate-500">{activity.notes}</p>}
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-right text-sm font-semibold text-slate-700">
        Day total: ₹{dayCost.toLocaleString("en-IN")}
      </p>
    </div>
  );
}
