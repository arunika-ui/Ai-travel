"use client";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { TripForm } from "@/components/trip/TripForm";

export default function NewTripPage() {
  return (
    <AuthGuard>
      {(user) => (
        <>
          <SiteHeader />
          <main id="main-content" className="mx-auto max-w-2xl px-4 py-8">
            <h1 className="text-2xl font-bold text-slate-900">Plan a new trip</h1>
            <p className="mt-1 text-slate-600">Pick a destination and we&apos;ll build a day-by-day itinerary.</p>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <TripForm user={user} />
            </div>
          </main>
          <Footer />
        </>
      )}
    </AuthGuard>
  );
}
