"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { updatePreferences, updateProfile, deleteAccount, logout } from "@/lib/trips/auth";
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
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [homeCity, setHomeCity] = useState(user.homeCity);
  const [style, setStyle] = useState(user.preferences.style);
  const [pace, setPace] = useState(user.preferences.pace);
  const [budgetLevel, setBudgetLevel] = useState(user.preferences.budgetLevel);
  const [interests, setInterests] = useState<PlaceCategory[]>(user.preferences.interests);
  const [dietaryNeeds, setDietaryNeeds] = useState(user.preferences.dietaryNeeds);
  const [saved, setSaved] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function toggleInterest(interest: PlaceCategory) {
    setInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateProfile(user.id, { name, homeCity });
    updatePreferences(user.id, { style, pace, budgetLevel, interests, dietaryNeeds });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleDeleteAccount() {
    deleteAccount(user.id);
    logout();
    router.push("/");
  }

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-xl px-4 py-8">
        <h1 className="font-serif text-3xl text-ink">Profile & preferences</h1>
        <p className="mt-1 text-sm text-ink/60">{user.email}</p>

        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name</label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label htmlFor="homeCity" className="block text-sm font-medium text-slate-700">Home city</label>
              <input
                id="homeCity"
                value={homeCity}
                onChange={(e) => setHomeCity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="style" className="block text-sm font-medium text-slate-700">Travel style</label>
            <input
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="e.g. cultural, adventure, relaxed"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          </div>
          <div>
            <label htmlFor="dietaryNeeds" className="block text-sm font-medium text-slate-700">Dietary needs (optional)</label>
            <input
              id="dietaryNeeds"
              value={dietaryNeeds}
              onChange={(e) => setDietaryNeeds(e.target.value)}
              placeholder="e.g. vegetarian, no shellfish"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <fieldset>
            <legend className="block text-sm font-medium text-slate-700">Interests</legend>
            <p className="text-xs text-ink/50">These are defaults — you can still change them per trip.</p>
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

        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="font-medium text-red-900">Delete account</p>
          <p className="mt-1 text-sm text-red-700">
            Removes your account and every trip you own — itineraries, expenses, memory and AI
            history — from this browser (FR-1.8). This cannot be undone.
          </p>
          {!confirmingDelete ? (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="mt-3 rounded-lg border border-red-400 bg-white px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              Delete my account
            </button>
          ) : (
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleDeleteAccount}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Yes, permanently delete
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
