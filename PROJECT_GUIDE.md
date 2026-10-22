# AI Travel Companion — Project Guide

This document explains the project for a viva/demo: what each folder and file
does, in plain language. (This is Phase 1 of a 3-phase build; Phase 2 adds
the AI chat panel, Phase 3 adds expenses/places/sharing/admin.)

## How to run it

```bash
npm install
npm run dev      # starts the app at http://localhost:3000
npm run build    # production build (what Vercel runs)
npm run lint      # ESLint
npm test          # Vitest unit tests
```

No `.env` file or API key is needed. Log in with:
- Traveler: `riya@demo.com` / `demo123`
- Admin: `admin@demo.com` / `admin123`

## Top-level files

| File | Purpose |
|---|---|
| `package.json` | Dependencies and npm scripts (`dev`, `build`, `lint`, `test`). |
| `tsconfig.json` | TypeScript compiler config (strict mode, `@/` path alias to the repo root). |
| `next.config.js` | Next.js config (currently default settings). |
| `tailwind.config.ts` / `postcss.config.js` | Tailwind CSS setup and the custom `brand` color used for buttons/links. |
| `vitest.config.ts` | Test runner config — same `@/` alias as the app, runs in a Node environment. |
| `.eslintrc.json` | Lint rules (Next.js recommended set). |
| `README.md` | Setup/deploy instructions for anyone cloning the repo. |
| `PROJECT_GUIDE.md` | This file. |

## `app/` — pages (Next.js App Router)

Each folder under `app/` is a URL route. `page.tsx` is the page shown at that
route.

| Path | Route | What it shows |
|---|---|---|
| `app/layout.tsx` | (wraps every page) | HTML shell, page title, loads global CSS and the Leaflet map CSS. |
| `app/globals.css` | — | Tailwind base styles + a couple of small global tweaks (focus ring, map container sizing). |
| `app/page.tsx` | `/` | Public landing page with a "Log in to the demo" button and a feature summary. |
| `app/login/page.tsx` | `/login` | Login form plus the two one-tap demo buttons (traveler / admin) and the printed demo credentials. |
| `app/dashboard/page.tsx` | `/dashboard` | Signed-in traveler's trip list, grouped into Ongoing / Upcoming / Past using the computed trip status. |
| `app/trips/new/page.tsx` | `/trips/new` | "Create a new trip" form (destination, dates, travelers, budget, interests, pace). |
| `app/trips/[id]/page.tsx` | `/trips/<id>` | The trip workspace: status badge, itinerary tabs, map. This is where generation happens. |
| `app/profile/page.tsx` | `/profile` | Edit the logged-in user's travel preferences (style, pace, budget level, interests). |
| `app/settings/page.tsx` | `/settings` | "Reset demo data" button that restores the original seed trips. |

## `components/` — UI building blocks

Grouped by what they're for:

**`components/layout/`** — things shown on (almost) every page.
- `SiteHeader.tsx` — top nav bar; shows different links depending on whether
  someone is logged in, and as an admin or traveler.
- `Footer.tsx` — the "Demo data. Place details are approximate." footer note.
- `AuthGuard.tsx` — wraps a page's content and redirects to `/login` if
  nobody is logged in (or redirects non-admins away from admin-only pages).
  Pages use it like: `<AuthGuard>{(user) => <PageContent user={user} />}</AuthGuard>`.

**`components/dashboard/`**
- `TripCard.tsx` — one trip's card on the dashboard (title, dates, traveler
  count, budget, and a colored status badge).

**`components/trip/`** — the trip creation and workspace flow.
- `TripForm.tsx` — the new-trip form itself (validation, interest chips,
  pace selector). Used by `app/trips/new/page.tsx`.
- `TripWorkspace.tsx` — the biggest component: loads a trip, runs itinerary
  generation (with the step-by-step progress animation), and renders the
  Itinerary/Map tabs. Handles "regenerate this day" and "cancel trip".
- `GenerationProgress.tsx` — the small "🔧 tool() → result" list shown while
  the AI companion is "thinking".

**`components/itinerary/`** — viewing a generated plan.
- `ItineraryView.tsx` — day-tab switcher + budget bar, wraps `DayTimeline`.
- `DayTimeline.tsx` — one day's activities as a timeline, with the weather
  strip and a "Regenerate this day" button.
- `BudgetBar.tsx` — the ₹ spent vs. budget progress bar with the 80%/100%
  alert text.
- `MapPanel.tsx` — day picker + loads `MapView` client-side only (Leaflet
  needs the browser, so this uses `next/dynamic` with `ssr: false`).
- `MapView.tsx` — the actual Leaflet map: numbered pins for each activity,
  joined by a line in visiting order, OpenStreetMap tiles with attribution.

**`components/ui/`** — tiny generic pieces (`Badge.tsx`, `EmptyState.tsx`).

## `lib/` — all the logic, no UI

This is where the actual "engineering" lives. Organized to match the
package diagram you mentioned:

**`lib/trips/`** — the trip domain: types and CRUD-style functions.
- `types.ts` — every TypeScript type/interface in the app (`Trip`,
  `Itinerary`, `DayPlan`, `Activity`, `Expense`, `TripMemory`,
  `AICommandLog`, `Feedback`, `User`, `AppSettings`, enums like
  `TripStatus`). Read this file first to understand the data model.
- `itinerary.ts` — itinerary versioning: save a new version, list all
  versions, restore/undo to an older version.
- `expense.ts` — (used from Phase 3 on) expense CRUD and totals.
- `memory.ts` — (Phase 2) "things the AI remembered" CRUD.
- `commandLog.ts` — (Phase 2) AI command history + the daily command-limit counter.
- `auth.ts` — demo login/logout, current user, admin user list.
- `settings.ts` — app-wide settings (max tool calls per command, daily AI
  command limit) — read/written here, enforced by `MockTravelAgent`.
- `feedback.ts` — (Phase 3) star ratings on completed trips.
- `status.ts` — turns a `Trip` into its *current* status (see Business
  rules below) plus the label/color used for status badges.
- `share.ts` — (Phase 3) compresses a trip + itinerary into a URL-safe
  string with `lz-string` for the read-only share link.

**`lib/data/`** — persistence only.
- `localDb.ts` — the only file that touches `window.localStorage` directly.
  Reads/writes one JSON blob containing trips, itineraries, expenses,
  memory, command logs, users, settings and the logged-in session. Also
  has `resetDemoData()` for the Settings page button.
- `TripRepository.ts` — a small `TripRepository` **interface**
  (`list`, `get`, `save`, `remove`, `listByOwner`) with a
  `LocalStorageTripRepository` class implementing it. The point: UI code
  calls `tripRepository.get(id)` and never touches `localStorage` directly,
  so swapping in a real backend later (e.g. Supabase) means writing one new
  class, not touching any component.

**`lib/validation/`** — rules, not data.
- `schemas.ts` — Zod schemas for the trip form and (Phase 3) the expense
  form, with the day-count/travelers/budget/date-range rules and plain-English
  error messages.
- `businessRules.ts` — pure functions: `findAllOverlaps` (detects
  overlapping activity times), `fitToBudget` (drops the costliest optional
  activities until a plan is within budget), `computeTripStatus` (derives
  DRAFT/PLANNED/ONGOING/COMPLETED/ARCHIVED/CANCELLED from today's date),
  `budgetAlertLevel` (none/warning/over), and `highestDaySpend`.

**`lib/mock-data/`** — all the built-in sample data.
- `destinations.ts` — the 5 cities, ~15-17 real places each (name,
  category, indoor/outdoor, coordinates, cost, hours, rating, description)
  and 3 hotels per city.
- `weather.ts` — a deterministic forecast generator: hashes `city+date` into
  a repeatable temperature/rain forecast, with a hard-coded override so the
  Udaipur demo trip's Day 2 always shows 70% evening rain (this is what
  makes the "swap to indoor" chat demo reliable).
- `currency.ts` — the fixed INR/USD/EUR/GBP/AED/THB rate table and a
  `convertCurrency()` helper.
- `users.ts` — the 3 demo accounts (traveler, admin, and a second sample
  traveler) and default app settings.
- `seedTrips.ts` — builds the 4 demo trips (Udaipur/Goa/Jaipur/Manali) with
  dates relative to *today*, their itineraries, sample expenses, a memory
  entry and command-log entries — this is what `resetDemoData()` restores.

**`lib/ai/`** — the simulated AI agent.
- `TravelAgent.ts` — the **interface** (`generateItinerary`,
  `handleCommand`) that any agent implementation must satisfy. A real
  LLM-backed agent would implement this same interface.
- `MockTravelAgent.ts` — the current implementation: no LLM, just
  deterministic logic + the intent parser + the tools. (Phase 2 fleshes out
  `handleCommand`; Phase 1 only needs `generateItinerary`.)
- `generateItinerary.ts` — builds a full day-by-day plan from a trip's
  destination/dates/interests/pace/budget: picks places matching interests,
  schedules lunch/dinner, forces indoor activities when evening rain chance
  is high, and calls `fitToBudget` at the end. Also exports
  `regenerateDay()` for the single-day "Regenerate this day" button.
- `intentParser.ts` — (Phase 2) turns free-text chat commands into a typed
  `Intent` using keyword/regex matching — no LLM involved.

**`lib/tools/`** — the five "AI tools", each a self-contained object with a
`name`, `description`, Zod `params` schema and an `execute()` function (see
`types.ts` for the shared `AITool` interface):
- `getWeather.ts` — wraps `mock-data/weather.ts`.
- `searchPlaces.ts` — filters `mock-data/destinations.ts` places by
  category/indoor/cost/text query.
- `getRoute.ts` — straight-line (haversine) distance + a rough travel-time
  estimate between two points.
- `convertCurrency.ts` — wraps `mock-data/currency.ts`.
- `getItinerary.ts` — reads a trip's current itinerary + total cost.
- `index.ts` — exports `ALL_TOOLS` and `TOOLS_BY_NAME` so the agent can look
  tools up generically.

## `test/` — Vitest unit tests

- `validation.test.ts` — boundary-value tests for trip length (0/1/2/15/29/
  30/31 days), travelers (0/1/2/5/9/10/11) and budget (999/1000/1001/499999/
  500000/500001), plus start-date-in-the-past and end-before-start checks.
- `businessRules.test.ts` — overlap detection, `fitToBudget`, every branch of
  `computeTripStatus`, `budgetAlertLevel`, and `highestDaySpend` (including
  the `(7000, 7000, 2000) → 7000` tie case).
- `currency.test.ts` — INR→INR identity, USD→INR and INR→USD at the fixed
  rate, and a cross-currency (EUR→USD) conversion.

Run them with `npm test`.

## What's next (Phase 2 and 3, not yet built)

- **Phase 2**: the AI chat panel UI wired to `MockTravelAgent.handleCommand`
  (swap/add/remove/move/pace/budget commands, weather/spending/places
  questions), a "Remembered" chip + memory editor screen, and the command
  history view.
- **Phase 3**: the Expenses tab UI (CRUD + category/day totals + CSV
  export), a places-search-on-the-map UI, the read-only share page, star
  rating/feedback UI, and the admin console.

These are tracked and will land as further commits to `main`.
