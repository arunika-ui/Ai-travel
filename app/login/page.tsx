"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { login } from "@/lib/trips/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleLogin(e: React.FormEvent, overrideEmail?: string, overridePassword?: string) {
    e.preventDefault();
    const user = login(overrideEmail ?? email, overridePassword ?? password);
    if (!user) {
      setError("Email or password is incorrect. Use one of the demo accounts below.");
      return;
    }
    router.push(user.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900">Log in</h1>
        <p className="mt-1 text-sm text-slate-600">
          This is a demo — no real authentication. Use the one-tap buttons or the sample
          credentials below.
        </p>

        <div className="mt-6 space-y-2">
          <button
            type="button"
            onClick={(e) => handleLogin(e, "riya@demo.com", "demo123")}
            className="w-full rounded-lg bg-brand-600 px-4 py-3 text-base font-semibold text-white hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            Log in as demo traveler
          </button>
          <button
            type="button"
            onClick={(e) => handleLogin(e, "admin@demo.com", "admin123")}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-700 hover:border-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            Log in as admin
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-medium text-slate-700">Demo credentials</p>
          <p>Traveler: riya@demo.com / demo123</p>
          <p>Admin: admin@demo.com / admin123</p>
        </div>

        <form onSubmit={handleLogin} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              aria-describedby={error ? "login-error" : undefined}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              aria-describedby={error ? "login-error" : undefined}
            />
          </div>
          {error && (
            <p id="login-error" role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            Log in manually
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}
