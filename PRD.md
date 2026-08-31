# Product Requirements Document — AxionHR Haven

**Status:** Living document, reflects the app as built
**Owner:** arciaganicoleanne09@gmail.com
**Last updated:** 2026-08-31

## 1. Summary

AxionHR Haven is an employee wellness platform that pairs a real attendance/shift-tracking system with burnout monitoring, mental and physical wellness tools, peer appreciation, and an HR/admin console. The core product bet is that wellness features are only trustworthy if they're computed from real work data (actual clock-in/out timestamps, actual mood logs) rather than static or fabricated numbers — every metric in the app should be traceable to something a user actually did.

## 2. Problem statement

Most workplace wellness tools are either (a) a bolt-on survey nobody fills out, or (b) a set of dashboard widgets with numbers nobody can verify. Employees don't trust a "burnout score" they can't see the inputs for, and HR teams can't act on attendance or wellness signals that aren't grounded in real timestamps. AxionHR Haven's premise is that a single wall-clock-driven work-hours model (clock in, clock out, lateness, overtime) can drive every downstream metric — burnout risk, attendance rate, HR alerts — consistently, instead of each feature inventing its own numbers.

## 3. Goals

- Give employees one place to track their workday, mood, and physical wellness habits, and to privately appreciate teammates.
- Give HR/admin a real-time, trustworthy view of team burnout risk and attendance, backed by the same underlying data employees see about themselves.
- Make every number in the product either genuinely computed or explicitly absent — no placeholder metrics, no decorative UI that implies functionality that isn't there.
- Run entirely on local infrastructure (JSON file store + localStorage) with zero required external services, so the product can be evaluated or demoed without any setup.

### Non-goals

- Payroll processing, benefits administration, or legal compliance tracking.
- Deep calendar/meeting-platform integrations (the app does not import real meeting data).
- Multi-tenant / multi-company support — the current data model assumes one organization.
- Native mobile apps (the web app is responsive, not packaged).

## 4. Users and roles

The app has three roles, seeded as demo accounts:

| Role | Demo login | Primary needs |
|---|---|---|
| Employee | `employee@axionhr.com` / `emp123` | Track my own shift, mood, hydration, breaks; see my burnout score; appreciate teammates privately; request PTO |
| HR Manager | `hr@axionhr.com` / `hr123` | See team-wide burnout heatmap and live attendance; receive confidential wellness flags; approve PTO |
| Admin | `admin@axionhr.com` / `admin` | Everything HR can do, plus account management (create/disable/restore users, role assignment) |

Sign-in also accepts the email's local part alone (e.g. `admin`) as a shortcut.

## 5. Functional requirements

### 5.1 Attendance & shift tracking
- Clock in / clock out, with a live timer driven by wall-clock timestamps (`segmentStartedAt` + banked seconds) so elapsed time stays correct across page refresh, tab close, and re-login — not a `setInterval` counter that resets.
- Lateness computed against a fixed 9:00 AM standard start (`getLateMinutes`); the same definition is reused everywhere lateness is shown (dashboard badge, weekly summary, analytics card and chart, attendance calendar) so the number never disagrees with itself across the app.
- Weekly on-time rate and late-day count, surfaced on the Overview Dashboard's "This Week" strip and the Predictive Analytics view.
- Monthly attendance calendar with per-day shift detail (clock-in/out time, worked hours, overtime).
- Overtime tracked as hours worked beyond the standard shift length, feeding the burnout score.

### 5.2 Burnout Predictor
- A single 0–100 risk score (`overallScore`) with a `low` / `medium` / `high` risk level, computed from mood check-ins, worked hours, and overtime — no manual input.
- Weekly trend indicator (`improving` / `stable` / `worsening`).
- A plain-language list of contributing risk factors, populated only when real factors exist (empty state shown otherwise, not a placeholder score).
- Visualized as a ring gauge on the dashboard's Burnout Risk tile, with the trend and risk factors laid out alongside it.

### 5.3 Mental & AI Coach
- Daily mood check-in with an energy rating; log history viewable via a scroll wheel.
- Scripted wellness chat coach ("AI Haven Wellness Coach") for guided prompts — not a live LLM integration.

### 5.4 Physical Health
- Hydration tracker with a configurable reminder interval.
- Guided micro-break timers: posture/shoulder stretch, 20-20-20 eye rest, short walk — each with its own interval and active/inactive toggle.

### 5.5 Peer Appreciation
- Private, 1:1 conversations only — no public company-wide feed. A sender selects a recipient from their available colleagues and sends a message, optionally tagged with a badge type and an optional coffee-voucher note.
- Conversation view is a real filter over the shared badge data (sender/recipient match in either direction), not a separate per-pair data store — verified to correctly isolate each pair's messages from every other conversation.
- Recipient stays selected after sending, so the view behaves like a persistent thread rather than a one-shot form.

### 5.6 Adaptive Focus Mode & Accessibility
- Dyslexia-friendly font toggle, high-contrast mode, reduced-motion / clutter-reduction toggle.
- Notification batching: non-urgent alerts queue into a digest instead of interrupting immediately; queue count is visible.
- Pomodoro-style focus timer (25-minute focus / 5-minute break) with start/pause/reset and a mode switch.

### 5.7 Boundary Guard
- Configurable quiet hours (start/end).
- While active, non-urgent notifications are genuinely held (not just visually suppressed) and delivered as a digest when the window ends, or released manually.
- Auto-reply message configurable for the quiet-hours window.

### 5.8 HR Executive View (HR Manager, Admin)
- Team burnout heatmap by department (risk score, status, headcount, overworking count).
- Live team attendance board.
- Confidential wellness flags raised by employees, surfaced as actionable outreach items.
- PTO request approvals.

### 5.9 Account Management (Admin only)
- Create, disable, and restore user accounts.
- Role assignment (employee / hr_manager / admin).
- Soft-delete recovery vault — deleted accounts are recoverable, not immediately purged; a separate, explicit "permanently purge" action exists for final deletion.

### 5.10 PTO & Rest Hub
- Submit PTO requests against a category (e.g. vacation, sick).
- Category-based auto-approval rules where applicable.
- Balance tracking (total allowance, used, pending, remaining).

### 5.11 Overview Dashboard
- Bento-grid layout: a tall "Workday Shift Gauge" tile (with the weekly on-time-rate/late-days strip), a wide "Burnout Risk" hero tile, and a wide "Daily Mood Check-In" tile, arranged responsively (single column on mobile, a 2-column tablet layout, and an L-shaped 3-column desktop mosaic).

## 6. Non-functional requirements

- **Persistence:** per-user state (mood logs, shift timer, accessibility settings, boundary config, etc.) lives in `localStorage`, namespaced per account email. Shared state (accounts, PTO, badges, notifications, shifts) is served through Next.js API routes backed by flat JSON files under `.data/` (gitignored, created at runtime). No database is required to run the app.
- **Optional cloud sync:** if Supabase environment variables are present, some writes additionally sync there; the app must continue to function fully with them absent.
- **Responsiveness:** all views must be usable at mobile, tablet, and desktop widths; verified live at each breakpoint, not just assumed from Tailwind classes.
- **Theming:** full light/dark mode support across every view.
- **Accuracy over decoration:** no UI element should imply functionality that doesn't exist behind it (this was the explicit reason the "Weekly Meetings" metric and the ambient-soundscape picker were removed — both had no real data or logic behind them).
- **Code quality gates before any commit:** `tsc --noEmit` clean, `next build` clean (all API routes present), and ESLint checked against the running baseline with zero new errors introduced.

## 7. Tech stack

Next.js 16 (App Router, Turbopack) + React 19 + TypeScript, Tailwind CSS 4, Recharts for charts, optional Supabase client. See [README.md](HR-HAVEN/README.md) for setup instructions, environment variables, and the demo account table.

## 8. Known limitations / explicitly out of scope

- The AI Wellness Coach is scripted, not a live language-model integration.
- No real meeting-platform integration exists; anything meeting-related was removed from the product (see the "Weekly Meetings" → "Late Attendance" replacement) rather than left as a fabricated metric.
- Single-organization data model; no multi-tenant support.
- No native mobile app.

## 9. Open questions

- Should the scripted AI Coach be upgraded to a real model-backed conversation, and if so, what's the data-privacy boundary for employee mood/wellness data sent to a third-party API?
- Should PTO auto-approval rules be configurable per-department, or remain global?
- Is a public/opt-in appreciation feed worth reintroducing as a separate, explicitly-optional view now that the default is private-only (per the 2026-08 decision to replace, not augment, the public feed)?
