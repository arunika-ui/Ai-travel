"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { resetDemoData } from "@/lib/data/localDb";

export default function SettingsPage() {
  return (
    <AuthGuard>
      {() => <SettingsContent />}
    </AuthGuard>
  );
}

function SettingsContent() {
  const router = useRouter();
  const [done, setDone] = useState(false);

  function handleReset() {
    resetDemoData();
    setDone(true);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 800);
  }

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <p className="font-medium text-slate-900">Reset demo data</p>
          <p className="mt-1 text-sm text-slate-600">
            Restores the sample trips, itineraries, expenses, memory and command history to
            their original state. Your login session is kept.
          </p>
          <button
            onClick={handleReset}
            className="mt-3 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            Reset demo data
          </button>
          {done && <p role="status" className="mt-2 text-sm text-green-600">Demo data reset.</p>}
        </div>
      </main>
      <Footer />
    </>
  );
}
