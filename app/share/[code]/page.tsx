"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { SiteHeader } from "@/components/SiteHeader";
import { ItineraryView } from "@/components/ItineraryView";
import { MapPanel } from "@/components/MapPanel";
import { decodeTripFromShare } from "@/lib/share";

type Tab = "itinerary" | "map" | "expenses";

export default function SharePage({ params }: { params: { code: string } }) {
  const [tab, setTab] = useState<Tab>("itinerary");
  const trip = useMemo(() => decodeTripFromShare(params.code), [params.code]);

  if (!trip) {
    return (
      <>
        <SiteHeader />
        <main id="main-content" className="mx-auto max-w-2xl px-4 py-8 text-center">
          <p className="text-slate-700">This share link is invalid or corrupted.</p>
        </main>
      </>
    );
  }

  const itinerary = trip.versions[trip.currentVersion]?.itinerary;
  const totalExpensesINR = trip.expenses.reduce((sum, e) => sum + e.amountINR, 0);

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-6">
        <div
          role="note"
          aria-label="Read-only view"
          className="mb-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600"
        >
          You&apos;re viewing a read-only shared trip. No login required, no changes can be made.
        </div>

        <h1 className="text-2xl font-bold text-slate-900">{trip.input.destination}</h1>
        <p className="text-sm text-slate-600">
          {trip.input.startDate} to {trip.input.endDate} · {trip.input.travelers} traveler(s) ·
          Budget ₹{trip.input.budgetINR.toLocaleString("en-IN")}
        </p>

        {itinerary ? (
          <>
            <div className="mt-6 border-b border-slate-200">
              <nav className="flex gap-1" aria-label="Trip sections" role="tablist">
                {([
                  ["itinerary", "Itinerary"],
                  ["map", "Map"],
                  ["expenses", "Expenses"],
                ] as [Tab, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    role="tab"
                    aria-selected={tab === key}
                    onClick={() => setTab(key)}
                    className={clsx(
                      "rounded-t-lg px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                      tab === key
                        ? "border-b-2 border-brand-600 text-brand-700"
                        : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="mt-4" role="tabpanel">
              {tab === "itinerary" && <ItineraryView itinerary={itinerary} />}
              {tab === "map" && <MapPanel itinerary={itinerary} />}
              {tab === "expenses" && (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="font-medium text-slate-900">
                    Total spent: ₹{totalExpensesINR.toLocaleString("en-IN")} of ₹
                    {trip.input.budgetINR.toLocaleString("en-IN")}
                  </p>
                  <ul className="mt-3 divide-y divide-slate-100">
                    {trip.expenses.map((e) => (
                      <li key={e.id} className="py-2 text-sm">
                        {e.category} — {e.amount} {e.currency} (₹
                        {e.amountINR.toLocaleString("en-IN")})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="mt-6 text-slate-600">This trip doesn&apos;t have an itinerary yet.</p>
        )}
      </main>
    </>
  );
}
