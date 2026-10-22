"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { ImagePanel } from "@/components/landing/ImagePanel";
import { DESTINATIONS, PLACES, HOTELS } from "@/lib/mock-data/destinations";

const WAYS_TO_TRAVEL = [
  { title: "Heritage & Culture", body: "Palaces, forts and temples, paced so the history actually lands." },
  { title: "Beach & Adventure", body: "Shacks, surf and sunset lanes — or rafting, treks and mountain air." },
  { title: "Food & Markets", body: "Thalis, bazaars and the one cafe worth the detour." },
];

const JOURNEYS = [
  { title: "Udaipur Heritage Getaway", meta: "Heritage · 3 days" },
  { title: "Goa Beach Break", meta: "Beach & nightlife · 4 days" },
  { title: "Jaipur Weekend", meta: "Heritage & shopping · 2 days" },
  { title: "Manali Trip", meta: "Adventure · 5 days" },
];

const STEPS = [
  { n: "01", title: "Tell us your trip", body: "Destination, dates, travelers, budget, pace and interests." },
  { n: "02", title: "The AI builds the plan", body: "A day-by-day itinerary from real sample places, weather and budget." },
  { n: "03", title: "Chat to refine it", body: "Swap, add, remove or re-pace anything — with undo, always." },
];

export default function LandingPage() {
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = headlineRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lines = el.querySelectorAll<HTMLElement>("[data-line]");
    (async () => {
      const { gsap } = await import("gsap");
      gsap.set(lines, { yPercent: 110 });
      gsap.to(lines, { yPercent: 0, duration: 0.9, stagger: 0.12, ease: "power3.out", delay: 0.2 });
    })();
  }, []);

  return (
    <>
      {/* 1. Hero */}
      <section className="relative flex min-h-[92vh] flex-col justify-end bg-gradient-to-br from-ink via-brand-700 to-brand-900 text-ivory">
        <SiteHeader />
        <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-16">
          <p className="label-eyebrow text-ivory/70">AI Travel Companion · a software engineering demo</p>
          <h1 ref={headlineRef} className="mt-4 max-w-3xl font-serif text-5xl leading-[1.05] sm:text-6xl md:text-7xl">
            <span className="line-mask"><span data-line className="block">Plan journeys,</span></span>
            <span className="line-mask"><span data-line className="block italic">not logistics.</span></span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ivory/85">
            An AI companion builds the day-by-day plan, then takes your notes — &ldquo;this evening may
            rain, swap to something indoor&rdquo; — and redraws it on the spot.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/login"
              className="label-eyebrow border border-ivory bg-ivory px-6 py-3 text-ink hover:bg-transparent hover:text-ivory transition-colors"
            >
              Log in to the demo
            </Link>
            <a href="#philosophy" className="label-eyebrow border border-ivory/40 px-6 py-3 text-ivory hover:border-ivory transition-colors">
              See how it works
            </a>
          </div>
        </div>
        <div className="pointer-events-none mx-auto mb-6 w-full max-w-6xl px-4">
          <span className="label-eyebrow text-ivory/60">Scroll ↓</span>
        </div>
      </section>

      <main id="main-content">
        {/* 2. Philosophy */}
        <section id="philosophy" className="bg-ivory px-4 py-24">
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            <p className="font-serif text-2xl italic leading-relaxed text-ink sm:text-3xl">
              Every trip plan is a hundred small decisions — what to see before lunch, what to skip
              when it rains, what fits the budget. We built an AI companion that makes those decisions
              with you, out loud, and never pretends to be more certain than it is: every change is
              explained, versioned and undoable.
            </p>
          </ScrollReveal>
        </section>

        {/* 3. Destinations */}
        <section className="bg-ivory px-4 py-20">
          <ScrollReveal>
            <p className="label-eyebrow text-brand-600">Destinations</p>
            <h2 className="mt-2 font-serif text-4xl text-ink">Five places to start from</h2>
          </ScrollReveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DESTINATIONS.map((d, i) => (
              <ScrollReveal key={d.id} delay={i * 0.05} className={i === 0 ? "sm:col-span-2 lg:col-span-2" : ""}>
                <Link href="/login" className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
                  <ImagePanel
                    index={i}
                    caption={`${d.name}, ${d.state}`}
                    meta={d.blurb}
                    minHeight={i === 0 ? 320 : 220}
                  />
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* 4. Ways we travel */}
        <section className="bg-ink px-4 py-20">
          <ScrollReveal>
            <p className="label-eyebrow text-ivory/60">Ways we travel</p>
            <h2 className="mt-2 font-serif text-4xl text-ivory">Plan around what you actually want</h2>
          </ScrollReveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {WAYS_TO_TRAVEL.map((w, i) => (
              <ScrollReveal key={w.title} delay={i * 0.08}>
                <ImagePanel index={i + 2} caption={w.title} meta={w.body} minHeight={300} />
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* 5. Process */}
        <section className="bg-ivory px-4 py-24">
          <ScrollReveal>
            <p className="label-eyebrow text-brand-600">Process</p>
          </ScrollReveal>
          <div className="mt-8 grid gap-10 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <ScrollReveal key={s.n} delay={i * 0.1}>
                <p className="font-serif text-5xl text-brand-600">{s.n}</p>
                <div className="mt-3 h-px w-full bg-stone-300" />
                <h3 className="mt-4 font-serif text-2xl text-ink">{s.title}</h3>
                <p className="mt-2 text-sm text-ink/70">{s.body}</p>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* 6. Curated journeys */}
        <section className="bg-ivory px-4 py-20">
          <ScrollReveal>
            <p className="label-eyebrow text-brand-600">Curated journeys</p>
            <h2 className="mt-2 font-serif text-4xl text-ink">Four sample trips, ready to explore</h2>
          </ScrollReveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {JOURNEYS.map((j, i) => (
              <ScrollReveal key={j.title} delay={i * 0.05}>
                <Link href="/login" className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
                  <ImagePanel index={i + 1} caption={j.title} meta={j.meta} minHeight={260} />
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* 7. Trust */}
        <section className="bg-ivory px-4 py-20">
          <div className="grid gap-10 sm:grid-cols-2">
            <ScrollReveal>
              <div className="grid grid-cols-2 gap-6">
                <Stat value={String(DESTINATIONS.length)} label="Destinations" />
                <Stat value={`${PLACES.length}+`} label="Sample places" />
                <Stat value={`${HOTELS.length}`} label="Sample hotels" />
                <Stat value="0" label="API keys required" />
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <blockquote className="border-l-2 border-brand-600 pl-6">
                <p className="font-serif text-2xl italic text-ink">
                  &ldquo;The plan is never the finished product — it&apos;s the first draft of a
                  conversation.&rdquo;
                </p>
                <p className="label-eyebrow mt-3 text-ink/50">— Project philosophy</p>
              </blockquote>
            </ScrollReveal>
          </div>
        </section>

        {/* 8. Final CTA */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-ink px-4 py-24 text-center text-ivory">
          <ScrollReveal className="mx-auto max-w-2xl">
            <h2 className="font-serif text-4xl sm:text-5xl">Ready to see it plan a trip?</h2>
            <p className="mt-4 text-ivory/85">
              No sign-up, no API key — log in with the demo traveler account and watch it build an
              itinerary in seconds.
            </p>
            <Link
              href="/login"
              className="label-eyebrow mt-8 inline-block border border-ivory bg-ivory px-8 py-3 text-ink hover:bg-transparent hover:text-ivory transition-colors"
            >
              Log in to the demo
            </Link>
          </ScrollReveal>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-4xl text-brand-600">{value}</p>
      <p className="label-eyebrow mt-1 text-ink/60">{label}</p>
    </div>
  );
}
