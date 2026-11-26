# Ashai Apparel Smart Hub — Intern UI (Demo Prototype)

Responsive, mobile-first intern web application scaffolded from the mobile browser screenshots in `internUI/`.

> **Demo Mode Notice:** This repository contained only screenshots (`internUI/`) and the `.claude/skills/ashai-intern-ui/SKILL.md` guide—no backend APIs, production authentication, database, or internal company policy source code were present. All interactive flows use clearly labeled local browser demo data (`localStorage`) and do not invent production credentials or live APIs.

## Framework Choice

- **Next.js (App Router) + React + TypeScript + Tailwind CSS v4**
- **Why:** First-class zero-config support on Vercel (automatic Git branch previews and production builds), clean route structure matching the screenshot URLs (`/dashboard`, `/oras`, `/me/leads`, `/request`, `/more`), and seamless path to connect future server Route Handlers or API routes without re-architecting.

## Implemented Screens

- **Home (`/dashboard`, `/` redirects here):** Intern greeting without awkward name truncation, interactive *Abiso sa telepono* reminder toggle/snooze, *Ang Trabaho Mo* tool previews (`Stock Count`, `Gumawa ng sticker`, `Ayos ng lugar`, `Scanner`, `Locations`), live *Oras Ko* summary, shortcut tiles (`Oras`, `Request`, `Chat`), and interactive *Labels* print queue modal (`179 gawin ngayon`).
- **Oras (`/oras`):** OJT hour progress (`22.09 / 240`), lunch/shift rule callout, shift *Time in / Time out* with confirmation dialog, collapsible daily accomplishment cards (`Mga araw`) so past logs don't force excessive mobile scrolling, and a cross-link to `/me/leads` instead of duplicating the full Leads form inside Oras.
- **Leads (`/me/leads`, `/leads` redirects here):** *Client leads* creation form (Business, Contact, Channel, Lead URL, Next follow-up date + presets, Product, Status, Notes), search & status filter chips, inline status/note updates, and optional sample demo leads.
- **Request (`/request`):** 2×2 request category selector (`Leave`, `Materials`, `Cash Advance`, `Time-in correction`) with tailored fields, native mobile date/time pickers, auto-calculated leave days, post-interaction validation (replacing the permanently disabled button), and *My Requests* list.
- **More (`/more`):** Profile modal with local photo preview & demo reset, live searchable *Prepare* and *Stock & Buying* collapsible categories (`Expand all` / `Collapse all`), sign-out confirmation, and signed-out demo re-entry screen.
- **Shared Navigation (`AppShell`):** Sticky top header with global quick-search modal (`<dialog>`), skip link, single `<nav aria-label="Primary">` adapting from a fixed mobile bottom bar (`env(safe-area-inset-bottom)` clearance) to a desktop left sidebar, and keyboard-only `:focus-visible` outlines.

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (redirects to `/dashboard`).

### Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start local development server |
| `npm run build` | Build production bundle |
| `npm run start` | Run production server locally |
| `npm run typecheck` | Run TypeScript type checking (`tsc --noEmit`) |
| `npm run lint` | Run ESLint checks |

## Environment Variables

Copy `.env.example` to `.env.local` for local customization if needed (none are required for Demo Mode). **Never commit real secrets.**

| Variable Name | Required in Demo | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_MODE` | No (defaults to `demo`) | Distinguishes demo mode from future connected environments |
| `NEXT_PUBLIC_APP_URL` | No | Canonical base URL for metadata/links (set per environment in Vercel) |
| `NEXT_PUBLIC_ASHAI_API_BASE_URL` | No (future) | Base URL placeholder for future Ashai backend integration |
| `ASHAI_SESSION_SECRET` | No (future, server-only) | Server secret placeholder if cookie session auth is added later |
| `ASHAI_INTERNAL_API_TOKEN` | No (future, server-only) | Server API credential placeholder for future backend integration |

## GitHub & Vercel Deployment Workflow

This repository includes `vercel.json`, `next.config.ts`, `package.json`, `.gitignore`, and `.env.example` compatible with [Vercel's Git-based deployment workflow](https://vercel.com/docs/git):

1. **Create / Connect GitHub Repository:**
   - Initialize Git (if not already initialized), commit the project files, and push to your GitHub repository.
2. **Import into Vercel:**
   - In the Vercel dashboard, select **Add New → Project** and import your GitHub repository.
   - Vercel automatically detects **Next.js** (or reads `vercel.json`: build command `npm run build`, install command `npm install`, root directory `.`).
3. **Configure Environment Variables in Vercel:**
   - Add `NEXT_PUBLIC_APP_MODE=demo` and `NEXT_PUBLIC_APP_URL=https://<your-vercel-domain>` under **Project Settings → Environment Variables** (no secrets required in demo mode).
4. **Automatic Deployments:**
   - Every push to the default branch deploys to Production; pull requests and feature branches automatically generate Vercel Preview URLs.
