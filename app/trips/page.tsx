"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Trip } from "@/lib/types";
import { tripRepository } from "@/lib/storage/tripRepository";

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[] | null>(null);

  useEffect(() => {
    tripRepository.list().then(setTrips);
  }, []);

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">My Trips</h1>
          <Link
            href="/"
            className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            New trip
          </Link>
        </div>

        {trips === null && <p className="mt-4 text-slate-500">Loading...</p>}
        {trips?.length === 0 && (
          <p className="mt-4 text-slate-500">
            No trips yet. Trips you create are saved in this browser only.
          </p>
        )}
        <ul className="mt-6 space-y-3">
          {trips?.map((trip) => (
            <li key={trip.id}>
              <Link
                href={`/trip/${trip.id}`}
                className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <p className="font-semibold text-slate-900">{trip.input.destination}</p>
                <p className="text-sm text-slate-600">
                  {trip.input.startDate} to {trip.input.endDate} · {trip.input.travelers}{" "}
                  traveler(s)
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
