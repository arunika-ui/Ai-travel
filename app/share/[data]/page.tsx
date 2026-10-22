"use client";

import { useMemo } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { ItineraryView } from "@/components/itinerary/ItineraryView";
import { MapPanel } from "@/components/itinerary/MapPanel";
import { decodeShare } from "@/lib/trips/share";
import { Trip } from "@/lib/trips/types";

export default function SharePage({ params }: { params: { data: string } }) {
  const payload = useMemo(() => decodeShare(params.data), [params.data]);

  if (!payload) {
    return (
      <>
        <SiteHeader />
        <main id="main-content" className="mx-auto max-w-2xl px-4 py-8 text-center">
          <p className="text-slate-700">This share link is invalid or corrupted.</p>
        </main>
        <Footer />
      </>
    );
  }

  const pseudoTrip: Trip = {
    id: "shared",
    title: payload.trip.title,
    destination: payload.trip.destination,
    startDate: payload.trip.startDate,
    endDate: payload.trip.endDate,
    travelers: payload.trip.travelers,
    budget: 0,
    currency: payload.trip.currency,
    interests: [],
    pace: "moderate",
    status: "PLANNED",
    ownerId: "",
    createdAt: "",
  };

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-6">
        <div role="note" aria-label="Read-only view" className="mb-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
          You&apos;re viewing a read-only shared itinerary. No login required, no changes can be made. Expenses and AI
          memory are not included in a shared link.
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{payload.trip.title}</h1>
        <p className="text-sm text-slate-600">
          {payload.trip.destination} · {payload.trip.startDate} to {payload.trip.endDate} · {payload.trip.travelers} traveler(s)
        </p>

        <div className="mt-6 space-y-6">
          <ItineraryView trip={pseudoTrip} days={payload.itinerary.days} readOnly />
          <MapPanel days={payload.itinerary.days} />
        </div>
      </main>
      <Footer />
    </>
  );
}
