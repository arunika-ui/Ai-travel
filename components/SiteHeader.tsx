import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-lg font-semibold text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
        >
          ✈️ AI Travel Companion
        </Link>
        <nav aria-label="Primary">
          <Link
            href="/trips"
            className="text-sm font-medium text-slate-600 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded px-2 py-1"
          >
            My Trips
          </Link>
        </nav>
      </div>
    </header>
  );
}
