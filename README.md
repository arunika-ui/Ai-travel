# AI Travel Companion

A software engineering lab demo: an AI-assisted trip planner that runs
**entirely in the browser** from built-in sample data. No API keys, no
backend services, no database, no paid APIs. The only external calls are
free OpenStreetMap map tiles — if those fail to load, the rest of the app
still works.

## What it does

- **Create a trip** against one of 5 destinations (Udaipur, Goa, Jaipur,
  Manali, Rishikesh), with validated dates, travelers, budget, interests
  and pace.
- **Generates a day-by-day itinerary** with a simulated AI agent
  (`MockTravelAgent`) that picks real sample places, checks a deterministic
  weather forecast, keeps lunch/dinner stops, avoids overlapping times, and
  fits the plan to budget — showing step-by-step "thinking" messages as it
  works. A single day can be regenerated on its own.
- **AI chat panel** — the main demo feature. Type commands like *"Day 2
  evening may rain, swap to something indoor"* and the agent parses the
  intent, "calls" up to 5 simulated tools, updates the itinerary (with
  Undo), and remembers lasting preferences. Weather/spending/places
  questions get answered without changing the plan. Everything is labeled
  **"Demo mode: simulated AI"** — no LLM is involved.
- **Map** of each day's activities (Leaflet + OpenStreetMap, numbered pins
  joined in visiting order), plus a places search to add a result straight
  to a chosen day.
- **Expenses** — add/edit/delete, converted to the trip currency with a
  fixed rate table, totals by category and by day, an 80%/100% budget
  alert, and CSV export.
- **Read-only share links** — `/share/<code>` encodes the itinerary with
  `lz-string` into the URL itself, so it opens with no login and no server
  lookup (expenses and AI memory are left out of the link on purpose).
- **Feedback** — 1–5 star rating on completed trips, thumbs up/down on
  individual AI replies.
- **Admin console** (`admin@demo.com`) — users with suspend/activate, trips
  created, AI commands per day, most-used tools, average rating, and the
  "max tool calls per command" / "daily AI command limit" settings that the
  chat agent actually enforces.

## Demo accounts

Shown on the login page with one-tap buttons:
- Traveler: `riya@demo.com` / `demo123`
- Admin: `admin@demo.com` / `admin123`

Riya's account comes pre-loaded with 4 trips, dated **relative to today** so
their status always looks right: an upcoming Udaipur trip (day 2 is always
forecast 70% evening rain — see "Demo script" below), an ongoing Goa trip
near its budget limit, a completed Jaipur trip, and a draft Manali trip
with no itinerary yet. **Settings → Reset demo data** restores all of this
at any time.

## Demo script (6–8 steps for a viva)

1. **Log in** as the demo traveler (one-tap button on `/login`).
2. **Dashboard** — point out the status groups (Ongoing / Upcoming / Past)
   and that Goa shows a budget warning badge.
3. Open **Udaipur Heritage Getaway** → **Itinerary** tab. Show Day 2's
   timeline and the weather strip ("Rain, 70% evening chance").
4. Go to the **AI Chat** tab and send: *"Day 2 evening may rain, swap to
   something indoor."* Watch the simulated tool calls appear
   (`🔧 getWeather()`, `🔧 searchPlaces()`), then the before/after reply and
   the **Undo** button. Click into the **Memory** tab to show the
   "Remembered: prefers indoor evenings on rainy nights" entry it saved.
5. In chat, try *"Fit the plan into ₹20,000"* to show budget-aware editing,
   then *"What's the weather on day 2?"* to show a question that doesn't
   change the plan.
6. Open the **Map** tab, use **Search places** (e.g. category = food,
   indoor only) and add a result straight to Day 3.
7. Go to **Expenses**, add one, and point out the category/day bars and the
   budget alert.
8. Click **Share read-only link**, open it in a private tab to show it
   loads with no login, then switch to the **admin@demo.com** account to
   show the AI-commands chart, most-used tools, and the settings that
   control the chat agent's tool-call/daily-command limits.

## Tech stack

Next.js 14 (App Router) · TypeScript (strict) · Tailwind CSS · Zod ·
Leaflet + react-leaflet · lz-string · Vitest.

## Architecture

```
app/            Pages (routes)
components/     UI, grouped by feature (layout, dashboard, trip,
                itinerary, chat, expenses, places, ui)
lib/trips/      Trip/itinerary/expense/memory/commandLog/share domain logic
lib/ai/         TravelAgent interface + MockTravelAgent + intent parser
lib/tools/      5 AITool implementations (name, description, zod params,
                execute()): getWeather, searchPlaces, getRoute,
                convertCurrency, getItinerary
lib/mock-data/  All built-in sample data (destinations, weather, currency,
                users, seed trips)
lib/data/       TripRepository interface + localStorage implementation
lib/validation/ Zod schemas + business rules (overlap, budget, status)
test/           Vitest unit tests
```

See **`PROJECT_GUIDE.md`** for a file-by-file explanation of everything
above — useful if you're presenting the code itself.

### How the simulated AI works

`MockTravelAgent` (in `lib/ai/MockTravelAgent.ts`) implements the
`TravelAgent` interface with **no LLM at all**: a regex/keyword
`intentParser` classifies each chat message, the agent then calls into the
5 tools in `lib/tools/` (each reading from the sample data in
`lib/mock-data/`), applies the result with the same overlap/budget rules
used at itinerary-generation time, and returns a reply + optional updated
itinerary. The "🔧 tool() → result" lines in chat are literally the steps
the agent took, not decoration.

### Swapping in a real LLM later

Because everything goes through the `TravelAgent` interface
(`generateItinerary`, `handleCommand`), a real implementation (e.g. one
that calls an LLM with function/tool calling against the same 5
`AITool`s) can replace `MockTravelAgent` without any UI changes — just
change what `components/trip/TripWorkspace.tsx` and
`components/chat/ChatPanel.tsx` import.

### Swapping in a real backend later

All persistence goes through `lib/data/TripRepository.ts`'s
`TripRepository` interface, currently backed by
`LocalStorageTripRepository`. A Supabase-backed implementation can
replace it without touching any component, and the other domain modules
in `lib/trips/` would move the same way.

## Local setup

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
npm test          # Vitest
```

No `.env` file is needed for this demo build.

## Deploying to Vercel

Import the repository and deploy — **no environment variables, no build
configuration changes**. Vercel deploys from `main`.

## Known limitations

- Weather, places and hotels are a small curated sample per city, not a
  real catalogue — good enough to make the itinerary and chat demos
  realistic, not exhaustive.
- "Routing" (`getRoute`) is a straight-line distance estimate, not real
  road routing.
- Map tiles are the only external network call; if they fail to load
  (offline demo, blocked network) the map area shows normally but tiles
  may be blank — everything else keeps working.
- Trips, expenses, memory and command history live in this browser's
  `localStorage` only; they are not synced across devices (a share link is
  the way to show a trip elsewhere).
- Admin stats are computed from whatever is currently in local storage, so
  "Reset demo data" also resets the admin dashboards.
