import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          Plan trips with an AI travel companion
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-600">
          A software engineering demo: generate day-by-day itineraries, chat to tweak them,
          track expenses and share a read-only plan — all from built-in sample data, no
          external accounts required.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-brand-600 px-5 py-3 text-base font-semibold text-white hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            Log in to the demo
          </Link>
        </div>
        <div className="mt-12 grid gap-4 text-left sm:grid-cols-2">
          <Feature title="AI itinerary generation" body="A simulated agent builds a realistic day-by-day plan from sample places, weather and your budget." />
          <Feature title="Chat to edit" body="Ask it to swap a rainy evening activity, add a cafe, or fit the plan into a smaller budget." />
          <Feature title="Expenses & budget alerts" body="Log spending in any currency, converted to your trip currency, with an 80% budget alert." />
          <Feature title="Read-only share links" body="Share an itinerary link that opens without login — no server lookup needed." />
        </div>
      </main>
      <Footer />
    </>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{body}</p>
    </div>
  );
}
