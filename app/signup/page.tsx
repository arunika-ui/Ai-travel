"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { register } from "@/lib/trips/auth";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const result = register(name, email, password);
    if (!result.user) {
      setError(result.error ?? "Could not create that account.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-md px-4 py-10">
        <h1 className="font-serif text-3xl text-ink">Create an account</h1>
        <p className="mt-1 text-sm text-ink/70">
          Prototype sign-up: no email is actually sent, and the account only exists in this
          browser&apos;s local storage (the SRS&apos;s verification-email step, FR-1.3, is
          skipped for the same reason).
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
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
              aria-describedby={error ? "signup-error" : undefined}
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
              aria-describedby="password-hint"
            />
            <p id="password-hint" className="mt-1 text-xs text-slate-500">
              At least 8 characters, with one letter and one digit.
            </p>
          </div>
          {error && (
            <p id="signup-error" role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-brand-600 px-4 py-3 text-base font-semibold text-white hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            Create account
          </button>
        </form>

        <p className="mt-6 text-sm text-ink/70">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-700 underline">
            Log in
          </Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
