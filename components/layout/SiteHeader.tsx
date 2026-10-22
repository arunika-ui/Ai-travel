"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/lib/trips/types";
import { getCurrentUser, logout } from "@/lib/trips/auth";

export function SiteHeader() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link
          href={user ? "/dashboard" : "/"}
          className="text-lg font-semibold text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
        >
          ✈️ AI Travel Companion
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-3">
          {user && (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-brand-700 px-2 py-1 rounded focus-visible:ring-2 focus-visible:ring-brand-500">
                Trips
              </Link>
              <Link href="/profile" className="text-sm font-medium text-slate-600 hover:text-brand-700 px-2 py-1 rounded focus-visible:ring-2 focus-visible:ring-brand-500">
                Profile
              </Link>
              {user.role === "admin" && (
                <Link href="/admin" className="text-sm font-medium text-slate-600 hover:text-brand-700 px-2 py-1 rounded focus-visible:ring-2 focus-visible:ring-brand-500">
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-slate-600 hover:text-red-600 px-2 py-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Log out
              </button>
            </>
          )}
          {!user && (
            <Link href="/login" className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
