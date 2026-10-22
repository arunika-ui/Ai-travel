import { SiteHeader } from "@/components/SiteHeader";
import { TripForm } from "@/components/TripForm";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Plan your next trip</h1>
        <p className="mt-1 text-slate-600">
          Tell us where you&apos;re headed and we&apos;ll build a day-by-day plan with an AI
          travel companion you can chat with to tweak it.
        </p>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <TripForm />
        </div>
      </main>
    </>
  );
}
