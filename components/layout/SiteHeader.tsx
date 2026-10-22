"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import clsx from "clsx";
import { User } from "@/lib/trips/types";
import { getCurrentUser, logout } from "@/lib/trips/auth";

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const isHero = pathname === "/";

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  useEffect(() => {
    if (!isHero) {
      setScrolled(true);
      return;
    }
    setScrolled(false);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHero]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const transparent = isHero && !scrolled;

  return (
    <header
      className={clsx(
        "sticky top-0 z-40 transition-colors duration-300",
        transparent ? "bg-transparent" : "border-b border-stone-200 bg-ivory/95 backdrop-blur-sm"
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          href={user ? "/dashboard" : "/"}
          className={clsx(
            "font-serif text-xl tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded",
            transparent ? "text-ivory" : "text-ink"
          )}
        >
          AI Travel Companion
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-5">
          {user && (
            <>
              <Link
                href="/dashboard"
                className={clsx(
                  "label-eyebrow px-2 py-1 rounded focus-visible:ring-2 focus-visible:ring-brand-400",
                  transparent ? "text-ivory/90 hover:text-ivory" : "text-ink/70 hover:text-brand-600"
                )}
              >
                Trips
              </Link>
              <Link
                href="/profile"
                className={clsx(
                  "label-eyebrow px-2 py-1 rounded focus-visible:ring-2 focus-visible:ring-brand-400",
                  transparent ? "text-ivory/90 hover:text-ivory" : "text-ink/70 hover:text-brand-600"
                )}
              >
                Profile
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className={clsx(
                    "label-eyebrow px-2 py-1 rounded focus-visible:ring-2 focus-visible:ring-brand-400",
                    transparent ? "text-ivory/90 hover:text-ivory" : "text-ink/70 hover:text-brand-600"
                  )}
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className={clsx(
                  "label-eyebrow px-2 py-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
                  transparent ? "text-ivory/90 hover:text-ivory" : "text-ink/70 hover:text-brand-600"
                )}
              >
                Log out
              </button>
            </>
          )}
          {!user && (
            <Link
              href="/login"
              className={clsx(
                "label-eyebrow rounded-none border px-4 py-2 transition-colors focus-visible:ring-2 focus-visible:ring-brand-400",
                transparent
                  ? "border-ivory text-ivory hover:bg-ivory hover:text-ink"
                  : "border-brand-600 bg-brand-600 text-ivory hover:bg-brand-700"
              )}
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
