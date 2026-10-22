"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { updatePreferences } from "@/lib/trips/auth";
import { PlaceCategory, User } from "@/lib/trips/types";

const INTEREST_OPTIONS: PlaceCategory[] = [
  "heritage", "museum", "lake", "beach", "food", "cafe", "market", "adventure", "nature", "temple", "nightlife", "shopping",
];

export default function ProfilePage() {
  return (
    <AuthGuard>
      {(user) => <ProfileContent user={user} />}
    </AuthGuard>
  );
}

function ProfileContent({ user }: { user: User }) {
  const [style, setStyle] = useState(user.preferences.style);
  const [pace, setPace] = useState(user.preferences.pace);
  const [budgetLevel, setBudgetLevel] = useState(user.preferences.budgetLevel);
  const [interests, setInterests] = useState<PlaceCategory[]>(user.preferences.interests);
  const [saved, setSaved] = useState(false);

  function toggleInterest(interest: PlaceCategory) {
    setInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updatePreferences(user.id, { style, pace, budgetLevel, interests });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Profile & preferences</h1>
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <p className="font-medium text-slate-900">{user.name}</p>
          <p className="text-sm text-slate-600">{user.email}</p>
          <p className="text-sm text-slate-600">Home city: {user.homeCity}</p>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div>
            <label htmlFor="style" className="block text-sm font-medium text-slate-700">Travel style</label>
            <input
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label htmlFor="pace" className="block text-sm font-medium text-slate-700">Default pace</label>
            <select
              id="pace"
              value={pace}
              onChange={(e) => setPace(e.target.value as typeof pace)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="relaxed">Relaxed</option>
              <option value="moderate">Moderate</option>
              <option value="packed">Packed</option>
            </select>
          </div>
          <div>
            <label htmlFor="budgetLevel" className="block text-sm font-medium text-slate-700">Budget level</label>
            <select
              id="budgetLevel"
              value={budgetLevel}
              onChange={(e) => setBudgetLevel(e.target.value as typeof budgetLevel)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="budget">Budget</option>
              <option value="mid">Mid-range</option>
              <option value="luxury">Luxury</option>
            </select>
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
                    className={
                      active
                        ? "rounded-full border border-brand-600 bg-brand-600 px-3 py-1.5 text-sm font-medium capitalize text-white focus-visible:ring-2 focus-visible:ring-brand-500"
                        : "rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium capitalize text-slate-700 hover:border-brand-400 focus-visible:ring-2 focus-visible:ring-brand-500"
                    }
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            Save preferences
          </button>
          {saved && <p role="status" className="text-sm text-green-600">Saved.</p>}
        </form>

        <div className="mt-8">
          <a href="/settings" className="text-sm font-medium text-brand-700 underline">
            Go to settings (reset demo data)
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
