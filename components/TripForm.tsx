"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import clsx from "clsx";
import { tripInputSchema } from "@/lib/validation";
import { INTERESTS, Pace, Trip, TripInput } from "@/lib/types";
import { tripRepository } from "@/lib/storage/tripRepository";

const today = new Date().toISOString().slice(0, 10);
const defaultEnd = new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10);

export function TripForm() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [travelers, setTravelers] = useState(2);
  const [budgetINR, setBudgetINR] = useState(50000);
  const [interests, setInterests] = useState<string[]>([]);
  const [pace, setPace] = useState<Pace>("moderate");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const input: TripInput = {
      destination,
      startDate,
      endDate,
      travelers,
      budgetINR,
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
      shareCode: "",
      input: result.data,
      versions: [],
      currentVersion: -1,
      expenses: [],
      chat: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await tripRepository.save(trip);
    router.push(`/trip/${trip.id}?generate=1`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <label htmlFor="destination" className="block text-sm font-medium text-slate-700">
          Destination
        </label>
        <input
          id="destination"
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="e.g. Jaipur, India"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          aria-invalid={!!errors.destination}
          aria-describedby={errors.destination ? "destination-error" : undefined}
        />
        {errors.destination && (
          <p id="destination-error" role="alert" className="mt-1 text-sm text-red-600">
            {errors.destination}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">
            Start date
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            aria-invalid={!!errors.startDate}
            aria-describedby={errors.startDate ? "startDate-error" : undefined}
          />
          {errors.startDate && (
            <p id="startDate-error" role="alert" className="mt-1 text-sm text-red-600">
              {errors.startDate}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-slate-700">
            End date
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            aria-invalid={!!errors.endDate}
            aria-describedby={errors.endDate ? "endDate-error" : undefined}
          />
          {errors.endDate && (
            <p id="endDate-error" role="alert" className="mt-1 text-sm text-red-600">
              {errors.endDate}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="travelers" className="block text-sm font-medium text-slate-700">
            Travelers (1-10)
          </label>
          <input
            id="travelers"
            type="number"
            min={1}
            max={10}
            value={travelers}
            onChange={(e) => setTravelers(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            aria-invalid={!!errors.travelers}
            aria-describedby={errors.travelers ? "travelers-error" : undefined}
          />
          {errors.travelers && (
            <p id="travelers-error" role="alert" className="mt-1 text-sm text-red-600">
              {errors.travelers}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-slate-700">
            Budget (₹1,000 - ₹5,00,000)
          </label>
          <input
            id="budget"
            type="number"
            min={1000}
            max={500000}
            step={500}
            value={budgetINR}
            onChange={(e) => setBudgetINR(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            aria-invalid={!!errors.budgetINR}
            aria-describedby={errors.budgetINR ? "budget-error" : undefined}
          />
          {errors.budgetINR && (
            <p id="budget-error" role="alert" className="mt-1 text-sm text-red-600">
              {errors.budgetINR}
            </p>
          )}
        </div>
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-slate-700">Interests</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {INTERESTS.map((interest) => {
            const active = interests.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                aria-pressed={active}
                className={clsx(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                  active
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-brand-400"
                )}
              >
                {interest}
              </button>
            );
          })}
        </div>
        {errors.interests && (
          <p role="alert" className="mt-1 text-sm text-red-600">
            {errors.interests}
          </p>
        )}
      </fieldset>

      <div>
        <label htmlFor="pace" className="block text-sm font-medium text-slate-700">
          Pace
        </label>
        <select
          id="pace"
          value={pace}
          onChange={(e) => setPace(e.target.value as Pace)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="relaxed">Relaxed</option>
          <option value="moderate">Moderate</option>
          <option value="packed">Packed</option>
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
