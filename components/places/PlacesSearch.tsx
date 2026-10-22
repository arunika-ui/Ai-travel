"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import { Activity, DayPlan, Place, PlaceCategory, Trip } from "@/lib/trips/types";
import { searchPlaces } from "@/lib/tools/searchPlaces";
import { getPlaceDetails } from "@/lib/tools/getPlaceDetails";
import { saveNewVersion } from "@/lib/trips/itinerary";
import { reportPlace } from "@/lib/trips/report";

const CATEGORIES: PlaceCategory[] = [
  "heritage", "museum", "lake", "beach", "food", "cafe", "market", "adventure", "nature", "temple", "nightlife", "shopping",
];

const SLOT_START_MINUTES: Record<string, number> = { morning: 9 * 60, afternoon: 14 * 60, evening: 18 * 60 };

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function PlacesSearch({
  trip,
  days,
  onDaysUpdated,
}: {
  trip: Trip;
  days: DayPlan[];
  onDaysUpdated: (days: DayPlan[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<PlaceCategory | "">("");
  const [indoor, setIndoor] = useState<"any" | "indoor" | "outdoor">("any");
  const [maxCost, setMaxCost] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const found = searchPlaces.execute({
      cityId: trip.destination,
      query: query || undefined,
      category: category || undefined,
      indoor: indoor === "any" ? undefined : indoor === "indoor",
      maxCostPerPerson: maxCost ? Number(maxCost) : undefined,
    });
    setResults(found);
  }

  function handleAdd(place: Place, dayNumber: number, timeOfDay: "morning" | "afternoon" | "evening") {
    const dayIdx = days.findIndex((d) => d.dayNumber === dayNumber);
    if (dayIdx === -1) return;
    const startMinutes = SLOT_START_MINUTES[timeOfDay];
    const activity: Activity = {
      id: nanoid(8),
      title: place.name,
      startTime: minutesToTime(startMinutes),
      endTime: minutesToTime(startMinutes + place.durationMinutes),
      category: place.category,
      estCost: place.costPerPersonINR,
      notes: "Added from places search",
      placeId: place.id,
      lat: place.lat,
      lng: place.lng,
    };
    const updatedDays = days.map((d, i) =>
      i === dayIdx
        ? { ...d, activities: [...d.activities, activity].sort((a, b) => a.startTime.localeCompare(b.startTime)) }
        : d
    );
    saveNewVersion(trip.id, updatedDays);
    onDaysUpdated(updatedDays);
    setAddedMessage(`Added "${place.name}" to Day ${dayNumber}.`);
    setTimeout(() => setAddedMessage(null), 3000);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="font-semibold text-slate-900">Search places</h3>
      <form onSubmit={handleSearch} className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-4">
        <label className="sr-only" htmlFor="places-query">Search text</label>
        <input
          id="places-query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or description"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <select
          aria-label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value as PlaceCategory | "")}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">Any category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          aria-label="Indoor or outdoor"
          value={indoor}
          onChange={(e) => setIndoor(e.target.value as typeof indoor)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="any">Indoor or outdoor</option>
          <option value="indoor">Indoor only</option>
          <option value="outdoor">Outdoor only</option>
        </select>
        <div className="flex gap-2">
          <label className="sr-only" htmlFor="places-maxcost">Max cost per person</label>
          <input
            id="places-maxcost"
            type="number"
            min={0}
            value={maxCost}
            onChange={(e) => setMaxCost(e.target.value)}
            placeholder="Max ₹/person"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <button type="submit" className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white">
            Search
          </button>
        </div>
      </form>

      {addedMessage && <p role="status" className="mt-2 text-sm text-green-600">{addedMessage}</p>}

      <ul className="mt-4 space-y-2">
        {results.map((place) => (
          <li key={place.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-medium text-slate-900">{place.name}</p>
              <p className="text-sm text-slate-600">₹{place.costPerPersonINR}/person · ★{place.rating}</p>
            </div>
            <p className="text-sm text-slate-600">{place.description}</p>
            <p className="text-xs text-slate-400 capitalize">{place.category} · {place.indoor ? "Indoor" : "Outdoor"}</p>
            <PlaceDetailsFooter tripId={trip.id} place={place} />
            <AddToDayControl days={days} onAdd={(dayNumber, timeOfDay) => handleAdd(place, dayNumber, timeOfDay)} />
          </li>
        ))}
        {results.length === 0 && <p className="text-sm text-slate-500">Search above to see places in {trip.destination}.</p>}
      </ul>
    </div>
  );
}

function PlaceDetailsFooter({ tripId, place }: { tripId: string; place: Place }) {
  const [reported, setReported] = useState(false);
  const details = getPlaceDetails.execute({ placeId: place.id });
  if (!details) return null;

  function handleReport() {
    reportPlace(tripId, place.id, place.name, "Reported from places search");
    setReported(true);
  }

  return (
    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
      <span>Open {details.openingHoursText}</span>
      <a
        href={details.directionsUrl}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-brand-700 underline"
      >
        Directions
      </a>
      {reported ? (
        <span className="text-green-700">Reported — thanks</span>
      ) : (
        <button
          type="button"
          onClick={handleReport}
          className="font-medium text-slate-500 underline hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          Report incorrect info
        </button>
      )}
    </div>
  );
}

function AddToDayControl({
  days,
  onAdd,
}: {
  days: DayPlan[];
  onAdd: (dayNumber: number, timeOfDay: "morning" | "afternoon" | "evening") => void;
}) {
  const [day, setDay] = useState(days[0]?.dayNumber ?? 1);
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "afternoon" | "evening">("afternoon");

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
      <label className="sr-only" htmlFor={`day-select-${day}`}>Day</label>
      <select
        value={day}
        onChange={(e) => setDay(Number(e.target.value))}
        className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
      >
        {days.map((d) => (
          <option key={d.dayNumber} value={d.dayNumber}>Day {d.dayNumber}</option>
        ))}
      </select>
      <select
        value={timeOfDay}
        onChange={(e) => setTimeOfDay(e.target.value as typeof timeOfDay)}
        className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
      >
        <option value="morning">Morning</option>
        <option value="afternoon">Afternoon</option>
        <option value="evening">Evening</option>
      </select>
      <button
        type="button"
        onClick={() => onAdd(day, timeOfDay)}
        className="rounded-lg border border-brand-300 bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        Add to day
      </button>
    </div>
  );
}
