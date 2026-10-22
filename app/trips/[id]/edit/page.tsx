"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { tripEditSchema } from "@/lib/validation/schemas";
import { DESTINATIONS } from "@/lib/mock-data/destinations";
import { Pace, PlaceCategory, Trip } from "@/lib/trips/types";
import { tripRepository } from "@/lib/data/TripRepository";
import { getCurrentItinerary, saveNewVersion } from "@/lib/trips/itinerary";
import { mockTravelAgent } from "@/lib/ai/MockTravelAgent";

const INTEREST_OPTIONS: PlaceCategory[] = [
  "heritage", "museum", "lake", "beach", "food", "cafe", "market", "adventure", "nature", "temple", "nightlife", "shopping",
];

export default function EditTripPage({ params }: { params: { id: string } }) {
  return (
    <AuthGuard>
      {() => <EditTripContent tripId={params.id} />}
    </AuthGuard>
  );
}

function EditTripContent({ tripId }: { tripId: string }) {
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState(DESTINATIONS[0].id);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState(20000);
  const [interests, setInterests] = useState<PlaceCategory[]>([]);
  const [pace, setPace] = useState<Pace>("moderate");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [promptRegenerate, setPromptRegenerate] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    tripRepository.get(tripId).then((t) => {
      setTrip(t);
      if (t) {
        setTitle(t.title);
        setDestination(t.destination);
        setStartDate(t.startDate);
        setEndDate(t.endDate);
        setTravelers(t.travelers);
        setBudget(t.budget);
        setInterests(t.interests);
        setPace(t.pace);
      }
    });
  }, [tripId]);

  function toggleInterest(interest: PlaceCategory) {
    setInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trip) return;
    setErrors({});

    const input = { title, destination, startDate, endDate, travelers, budget, interests, pace };
    const result = tripEditSchema.safeParse(input);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) fieldErrors[issue.path.join(".") || "form"] = issue.message;
      setErrors(fieldErrors);
      return;
    }

    const destinationOrDatesChanged =
      trip.destination !== result.data.destination ||
      trip.startDate !== result.data.startDate ||
      trip.endDate !== result.data.endDate;

    const updated: Trip = {
      ...trip,
      title: result.data.title,
      destination: result.data.destination,
      startDate: result.data.startDate,
      endDate: result.data.endDate,
      travelers: result.data.travelers,
      budget: result.data.budget,
      interests: result.data.interests as PlaceCategory[],
      pace: result.data.pace,
    };
    await tripRepository.save(updated);
    setTrip(updated);

    const hasItinerary = getCurrentItinerary(trip.id) !== null;
    if (destinationOrDatesChanged && hasItinerary) {
      setPromptRegenerate(true);
    } else {
      router.push(`/trips/${trip.id}`);
    }
  }

  async function handleRegenerate() {
    if (!trip) return;
    setRegenerating(true);
    const { days } = mockTravelAgent.generateItinerary(trip);
    saveNewVersion(trip.id, days);
    router.push(`/trips/${trip.id}`);
  }

  if (trip === undefined) {
    return <p className="mx-auto max-w-2xl px-4 py-10 text-center text-slate-500">Loading...</p>;
  }
  if (!trip) {
    return <p className="mx-auto max-w-2xl px-4 py-10 text-center text-slate-700">Trip not found.</p>;
  }

  if (promptRegenerate) {
    return (
      <>
        <SiteHeader />
        <main id="main-content" className="mx-auto max-w-xl px-4 py-10 text-center">
          <h1 className="font-serif text-2xl text-ink">Destination or dates changed</h1>
          <p className="mt-2 text-ink/70">
            Your trip details are saved. Since the destination or dates changed (FR-3.4), do you
            want to regenerate the itinerary from scratch, or keep the current plan as-is?
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {regenerating ? "Regenerating..." : "Regenerate itinerary"}
            </button>
            <button
              onClick={() => router.push(`/trips/${trip.id}`)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              Keep current plan
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-serif text-3xl text-ink">Edit trip</h1>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700">Trip title</label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-slate-700">Destination</label>
              <select
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                {DESTINATIONS.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}, {d.state}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">Start date</label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                {errors.startDate && <p role="alert" className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-slate-700">End date</label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                {errors.endDate && <p role="alert" className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="travelers" className="block text-sm font-medium text-slate-700">Travelers (1-10)</label>
                <input
                  id="travelers"
                  type="number"
                  min={1}
                  max={10}
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                {errors.travelers && <p role="alert" className="mt-1 text-sm text-red-600">{errors.travelers}</p>}
              </div>
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-slate-700">Budget (₹1,000 - ₹5,00,000)</label>
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
                {errors.budget && <p role="alert" className="mt-1 text-sm text-red-600">{errors.budget}</p>}
              </div>
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
                        "rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition-colors focus-visible:ring-2 focus-visible:ring-brand-500",
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
              <label htmlFor="pace" className="block text-sm font-medium text-slate-700">Pace</label>
              <select
                id="pace"
                value={pace}
                onChange={(e) => setPace(e.target.value as Pace)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="relaxed">Relaxed</option>
                <option value="moderate">Moderate</option>
                <option value="packed">Packed</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Save changes
              </button>
              <button
                type="button"
                onClick={() => router.push(`/trips/${trip.id}`)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
