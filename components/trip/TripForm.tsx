"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import clsx from "clsx";
import { tripInputSchema } from "@/lib/validation/schemas";
import { DESTINATIONS } from "@/lib/mock-data/destinations";
import { Pace, PlaceCategory, Trip } from "@/lib/trips/types";
import { tripRepository } from "@/lib/data/TripRepository";

const INTEREST_OPTIONS: PlaceCategory[] = [
  "heritage", "museum", "lake", "beach", "food", "cafe", "market", "adventure", "nature", "temple", "nightlife", "shopping",
];

const today = new Date().toISOString().slice(0, 10);
const defaultEnd = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);

export function TripForm({ ownerId }: { ownerId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState(DESTINATIONS[0].id);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState(20000);
  const [interests, setInterests] = useState<PlaceCategory[]>([]);
  const [pace, setPace] = useState<Pace>("moderate");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function toggleInterest(interest: PlaceCategory) {
    setInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const destinationInfo = DESTINATIONS.find((d) => d.id === destination);
    const input = {
      title: title.trim() || `${destinationInfo?.name ?? "Trip"} Trip`,
      destination,
      startDate,
      endDate,
      travelers,
      budget,
      interests,
      pace,
    };

    const result = tripInputSchema.safeParse(input);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        fieldErrors[issue.path.join(".") || "form"] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    const trip: Trip = {
      id: nanoid(10),
      title: result.data.title,
      destination: result.data.destination,
      startDate: result.data.startDate,
      endDate: result.data.endDate,
      travelers: result.data.travelers,
      budget: result.data.budget,
      currency: "INR",
      interests: result.data.interests as PlaceCategory[],
      pace: result.data.pace,
      status: "DRAFT",
      ownerId,
      createdAt: new Date().toISOString(),
    };
    await tripRepository.save(trip);
    router.push(`/trips/${trip.id}?generate=1`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700">
          Trip title (optional)
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Udaipur Heritage Getaway"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div>
        <label htmlFor="destination" className="block text-sm font-medium text-slate-700">
          Destination
        </label>
        <select
          id="destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          {DESTINATIONS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}, {d.state}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="startDate" label="Start date" error={errors.startDate}>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </Field>
        <Field id="endDate" label="End date" error={errors.endDate}>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="travelers" label="Travelers (1-10)" error={errors.travelers}>
          <input
            id="travelers"
            type="number"
            min={1}
            max={10}
            value={travelers}
            onChange={(e) => setTravelers(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </Field>
        <Field id="budget" label="Budget (₹1,000 - ₹5,00,000)" error={errors.budget}>
          <input
            id="budget"
            type="number"
            min={1000}
            max={500000}
            step={500}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </Field>
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-slate-700">Interests</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((interest) => {
            const active = interests.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                aria-pressed={active}
                className={clsx(
                  "rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                  active ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-brand-400"
                )}
              >
                {interest}
              </button>
            );
          })}
        </div>
        {errors.interests && <p role="alert" className="mt-1 text-sm text-red-600">{errors.interests}</p>}
      </fieldset>

      <div>
        <label htmlFor="pace" className="block text-sm font-medium text-slate-700">
          Pace
        </label>
        <select
          id="pace"
          value={pace}
          onChange={(e) => setPace(e.target.value as Pace)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="relaxed">Relaxed (3 activities/day)</option>
          <option value="moderate">Moderate (4 activities/day)</option>
          <option value="packed">Packed (5 activities/day)</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-brand-600 px-4 py-3 text-base font-semibold text-white hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-60"
      >
        {submitting ? "Creating trip..." : "Create trip & generate itinerary"}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error && <p role="alert" className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
