# AI Travel Companion

An AI-assisted trip planner built with Next.js 14 (App Router), TypeScript, and
Tailwind CSS. Create a trip, generate a day-by-day itinerary with an AI agent
that calls live weather/places/geocoding tools, chat with the agent to tweak
the plan, track expenses with currency conversion, view each day on a map,
and share a read-only link — all with zero database setup.

## Features

- **Create Trip form** — destination, dates (1–30 days), travelers (1–10),
  budget (₹1,000–₹5,00,000), interests, and pace, validated on both the
  client and the server.
- **AI itinerary generation** — a server route calls OpenAI (`gpt-4o-mini`)
  with tool calling (`getWeather` via Open-Meteo, `searchPlaces`/`geocode`
  via OpenStreetMap Nominatim — no API keys needed for any of them). The
  response streams progress updates to the UI and is validated against a
  budget and no-overlapping-times rule before being accepted; the model is
  asked to retry if it violates either.
- **AI chat panel** — natural-language edits ("Day 2 evening may rain, swap
  to something indoor") run an agent loop (up to 5 tool calls) and return an
  updated itinerary plus a change summary. Every edit creates a new
  itinerary version, and you can **Undo** back to the previous one.
- **Map tab** — each day's activities are plotted with Leaflet/OpenStreetMap
  tiles, connected in visit order.
- **Expenses tab** — log amount + currency + category, auto-converted to INR
  via `frankfurter.app`, totals by category, and an alert at 80% of budget.
- **Share** — a read-only link that base64-encodes the trip (itinerary,
  expenses, input) into the URL, so it opens without login or a server
  lookup.

Trips are stored in `localStorage` behind a small `TripRepository`
interface (`lib/storage/tripRepository.ts`) so a Supabase-backed
implementation can be dropped in later without touching UI code.

The app is mobile-first and aims for WCAG AA: labeled form fields, visible
focus rings, `aria-live` status regions, `role="alert"` on errors, and
keyboard-operable tabs.

## Setup

```bash
npm install
cp .env.example .env.local
# edit .env.local and set OPENAI_API_KEY
npm run dev
```

Open http://localhost:3000.

### Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `OPENAI_API_KEY` | Yes | Used only server-side (API routes); never sent to the client. |

No other service requires a key: Open-Meteo, OpenStreetMap Nominatim, and
frankfurter.app are all called without credentials.

## Deploying to Vercel

1. Push this repo to GitHub (already done if you're reading this on GitHub).
2. Import the repo in Vercel.
3. Add one environment variable: `OPENAI_API_KEY`.
4. Deploy — no build configuration changes are needed.

## Project structure

```
app/
  page.tsx                 Home — Create Trip form
  trip/[id]/page.tsx        Trip workspace (itinerary/map/expenses/chat)
  trips/page.tsx            Saved trips (from localStorage)
  share/[code]/page.tsx     Read-only shared trip view
  api/itinerary/route.ts    Streaming itinerary generation (OpenAI + tools)
  api/chat/route.ts         Chat-driven itinerary edits (agent loop)
components/                 UI components
lib/
  agent.ts                  OpenAI tool-calling loop shared by both routes
  itinerary.ts               Prompting + budget/overlap validation
  tools/                     getWeather, geocode, searchPlaces implementations
  storage/tripRepository.ts  localStorage data layer (swappable for Supabase)
  currency.ts                frankfurter.app INR conversion
  share.ts                   Share-link encode/decode
```

## Notes & limitations

- Weather forecasts beyond Open-Meteo's forecast window fall back gracefully
  (the itinerary still generates; the weather note is simply omitted).
- Nominatim is a shared public service with light rate limits; the app sends
  a descriptive `User-Agent` and keeps tool calls bounded (max 8 during
  generation, max 5 during a chat edit).
- Because trips live in `localStorage`, they're per-browser. Share links
  work across browsers/devices since the trip data is encoded in the URL.
