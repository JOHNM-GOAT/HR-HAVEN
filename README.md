# AxionHR Haven

An employee wellness platform built with Next.js — attendance and shift tracking, a live burnout-risk score, mood check-ins, peer appreciation, and an HR/admin console, wrapped around a real work-hours model (clock in/out, overtime, lateness) instead of static mock numbers.

## Features

**Six Wellness Pillars** (employee view)
- **AI Burnout Predictor** — a single risk score (0–100) driven by your mood check-ins, worked hours, and overtime, with a weekly trend and a plain-language list of what's driving it
- **Physical Health** — hydration tracker and guided micro-break timers (posture stretch, 20-20-20 eye rest, breathwork)
- **Mental & AI Coach** — mood check-ins with an energy rating, plus a scripted wellness chat coach
- **Appreciations** — send a teammate a private appreciation note; conversations are 1:1, not a public company feed
- **Adaptive Focus Mode** — dyslexia-friendly font, high-contrast mode, reduced motion, notification batching, and a Pomodoro timer
- **Boundary Guard** — set quiet hours; non-urgent notifications are actually held and delivered as a digest once the window ends (or when you release them manually)

**Attendance**
- Clock in/out with a live shift timer that keeps counting correctly across refreshes, closed tabs, and logins — it's driven by wall-clock timestamps, not a ticking counter that resets when the page isn't open
- Automatic lateness detection against a 9:00 AM standard start, visible on the dashboard and rolled up into a weekly on-time rate
- A monthly attendance calendar with per-day shift detail

**HR & Admin**
- **HR Executive View** — team burnout heatmap, live attendance board, PTO approvals, confidential wellness flags from teammates
- **Account Management** (admin only) — create/disable accounts, role management, a soft-delete recovery vault
- **PTO & Rest Hub** — request time off, category-based auto-approval rules, balance tracking

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19 + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com)
- [Recharts](https://recharts.org) for charts
- [Supabase](https://supabase.com) client (optional — see below)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy `.env.example` to `.env` and fill in your Supabase project's values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

Supabase is optional. Without it configured, the app falls back to a local JSON file store under `.data/` (created automatically) plus `localStorage` — you can run the whole thing with no external services at all.

### Demo accounts

The app ships with three seeded accounts, one per role:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@axionhr.com` | `admin` |
| HR Manager | `hr@axionhr.com` | `hr123` |
| Employee | `employee@axionhr.com` | `emp123` |

Sign-in also accepts just the part before the `@` (e.g. `admin`) if you don't want to type the full address.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## How data persists

There's no database requirement to run this locally:

- **Per-user state** (mood logs, shift timer, hydration, accessibility settings, boundary shield config, etc.) lives in `localStorage`, namespaced per account email — one browser can hold independent state for every seeded role at once.
- **Shared state** (accounts, PTO requests, appreciation badges, notifications, shifts) is served through Next.js API routes under `src/app/api/`, backed by flat JSON files in `.data/`.
- If Supabase environment variables are present, some writes additionally sync there; the app never *requires* it to function.

This means attendance lateness, the burnout score, and the appreciation conversations are computed from real interactions in your own session, not hardcoded — clock in late and the Late badge, the weekly on-time rate, and the AI Burnout Predictor's factors all update from that one action.

## Project structure

```
src/
  app/              Next.js App Router pages + API routes (src/app/api/*)
  components/       UI, grouped by feature (dashboard, health, mental, social, hr, admin, ...)
  context/          WellnessContext.tsx — the single app-wide state provider
  types/            Shared TypeScript types and pure domain logic (burnout scoring,
                     lateness calculation, quiet-hours windows, etc.)
  data/             Seed data for the three demo accounts
.data/              Local JSON persistence (created at runtime, gitignored)
```
