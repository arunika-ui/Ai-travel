"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { EmptyState } from "@/components/ui/EmptyState";
import { TripCard } from "@/components/dashboard/TripCard";
import { tripRepository } from "@/lib/data/TripRepository";
import { Trip } from "@/lib/trips/types";
import { getEffectiveStatus } from "@/lib/trips/status";

export default function DashboardPage() {
  return (
    <AuthGuard>
      {(user) => <DashboardContent ownerId={user.id} />}
    </AuthGuard>
  );
}

function DashboardContent({ ownerId }: { ownerId: string }) {
  const [trips, setTrips] = useState<Trip[] | null>(null);

  useEffect(() => {
    tripRepository.listByOwner(ownerId).then(setTrips);
  }, [ownerId]);

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900">My Trips</h1>
          <Link
            href="/trips/new"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            + New trip
          </Link>
        </div>

        {trips === null && <p className="mt-6 text-slate-500">Loading...</p>}

        {trips && trips.length === 0 && (
          <div className="mt-6">
            <EmptyState title="No trips yet" body="Create your first trip to see an AI-generated itinerary." />
          </div>
        )}

        {trips && trips.length > 0 && (
          <div className="mt-6 space-y-8">
            {renderGroup("Ongoing", trips, (s) => s === "ONGOING")}
            {renderGroup("Upcoming", trips, (s) => s === "PLANNED" || s === "DRAFT" || s === "GENERATING")}
            {renderGroup("Past", trips, (s) => s === "COMPLETED" || s === "ARCHIVED" || s === "CANCELLED" || s === "FAILED")}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function renderGroup(label: string, trips: Trip[], match: (status: ReturnType<typeof getEffectiveStatus>) => boolean) {
  const filtered = trips
    .map((t) => ({ trip: t, status: getEffectiveStatus(t) }))
    .filter(({ status }) => match(status));
  if (filtered.length === 0) return null;
  return (
    <section aria-labelledby={`group-${label}`}>
      <h2 id={`group-${label}`} className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {filtered.map(({ trip, status }) => (
          <TripCard key={trip.id} trip={trip} status={status} />
        ))}
      </div>
    </section>
  );
}
