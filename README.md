# Duo Pixel Agency

**Two designers. One pixel-perfect website.**

A production-ready booking platform for a two-person web design agency. Clients pick a
designer, fill a six-step brief, get a booking ID, and track the project live — no login
required. The two designers get a private dashboard to accept, progress and close projects.

It ships as **two separate websites built from one repo**:

| App | Entry | Routes | What it is |
| --- | --- | --- | --- |
| **Public website** | `index.html` → [`site/`](site/) | `/`, `/designers`, `/designer/:slug`, `/pricing`, `/contact`, `/book`, `/confirmation/:code` | Marketing, portfolio, pricing, contact and the booking flow |
| **Client & designer portal** | `portal.html` → [`portal/`](portal/) | `/track`, `/login`, `/signup`, `/account/my-bookings`, `/dashboard`, `/dashboard/bookings/:id` | Tracking, client area and both designer dashboards |

They share one data/auth layer in [`shared/`](shared/), one `package.json` and one Supabase
project. By default both are served from a **single origin** (local dev, `npm run preview`,
one-domain deploy) so the localStorage demo mode keeps working; deploy them on two domains
instead with `npm run build:site` + `npm run build:portal` — see [Deployment](#deployment).

Built with **React + TypeScript + Vite, Tailwind CSS, Supabase, React Router, React Hook Form
+ Zod and Framer Motion.**

---

## Table of contents

- [What is included](#what-is-included)
- [Quick start (no backend needed)](#quick-start-no-backend-needed)
- [Connecting Supabase](#connecting-supabase)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [The booking flow](#the-booking-flow)
- [Accounts](#accounts)
- [Deployment](#deployment)
- [Environment variables](#environment-variables)
- [Customising the site](#customising-the-site)

---

## What is included

**Public website** (`site/`)

| Page | Route | Notes |
| --- | --- | --- |
| Home | `/` | Hero, how it works, services, featured work, designers, testimonials, FAQ, CTA |
| Designers | `/designers` | Both designer cards with availability, price, delivery time |
| Designer profile | `/designer/markanti`, `/designer/sundar` | Photo, bio, skills, tools, portfolio gallery, reviews, ratings, "Book …" |
| Pricing | `/pricing` | Landing Page · Business · E-commerce · Web App/Portal · Custom — prices editable from the dashboard |
| Contact | `/contact` | WhatsApp, email, validated contact form |
| Book | `/book` | 6-step booking form with progress bar |
| Confirmation | `/confirmation/:code` | Unique `DPA-XXXXXX` ID, copy button, WhatsApp deep link, email status |

**Client & designer portal** (`portal/`)

| Page | Route | Notes |
| --- | --- | --- |
| Track | `/track` | Booking ID + phone lookup, live status timeline — no login |
| Log in / Sign up | `/login`, `/signup` | Email + Google via Supabase Auth |
| My bookings | `/account/my-bookings` | Status timeline, review submission once Completed |
| Designer dashboard | `/dashboard` | Private: my bookings, unassigned pool, profile editor, pricing editor, reviews |
| Booking detail | `/dashboard/bookings/:id` | Full brief, attachments, status control, internal notes, client contact |

Every navbar, footer and confirmation link crosses between the two apps through
`portalUrl()` / `siteUrl()` in [`shared/lib/links.ts`](shared/lib/links.ts) — leave
`VITE_PORTAL_URL` / `VITE_SITE_URL` empty for one origin, set them for two.

**Features**

- Multi-step booking form: designer → type → details → budget → contact → review, with a live
  progress bar, per-step Zod validation and editable review summary.
- File uploads (logo, sketches) to Supabase Storage — falls back to local capture when no
  backend is configured.
- Unique booking IDs (`DPA-XXXXXX`), public tracking by **ID + phone number**.
- Status timeline: `Pending → Accepted → In Design → Review → Revisions → Delivered → Completed`
  (plus `Cancelled`), updated by designers and mirrored live to clients via **Realtime**.
- Client reviews + star ratings on completed projects.
- WhatsApp deep links with a prefilled message containing the booking ID.
- Confirmation email through a bundled **Supabase Edge Function**.
- Row Level Security: clients only read their own bookings, designers read/update theirs and
  the unassigned pool, everyone can submit a booking.
- Mobile-first, dark premium theme, Framer Motion animations, SVG logo + favicon, generated
  avatars and portfolio artwork (zero external image requests → instant on mobile data).

---

## Quick start (no backend needed)

```bash
npm install
npm run dev
```

Open http://localhost:5173 for the public website — it serves **both apps from one origin**,
so `/book`, `/track`, `/login` and `/dashboard` all work exactly as they will in production.
The portal routes are rewritten to `portal.html` by the dev server automatically.

Everything boots in **local demo mode**: bookings, contact messages, auth, designer profile
edits and price edits are stored in `localStorage`, so **every button works out of the box**
with full seed data.

> Local mode is for development and demos. Connect Supabase before going live — see below.

---

## Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query** → paste [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
   Creates tables, RLS policies, the storage bucket and the realtime publication.
3. **SQL Editor** → paste [`supabase/seed.sql`](supabase/seed.sql) → **Run**.
   Inserts the two designers, five packages and the seeded reviews.
4. **Project Settings → API** → copy the Project URL and anon key into `.env`
   (see [`.env.example`](.env.example)).
5. **Authentication → Providers → Email**: enable *Confirm email* (recommended).
   **Authentication → Providers → Google**: add your OAuth client ID/secret to enable
   Google sign-in. Add `http://localhost:5173` and your production URL to the
   **Redirect URLs** list.
6. **Authentication → Users → Invite user** for the two designer accounts:
   - `markanti@duopixel.agency`
   - `sundar@duopixel.agency`

   The dashboard maps those two emails to their designer automatically.
7. *(Optional, for confirmation emails)*

   ```bash
   supabase functions deploy send-booking-email
   supabase secrets set RESEND_API_KEY=your_key \
     SMTP_FROM="Duo Pixel Agency <duopixelagency@gmail.com>" \
     SITE_URL=https://your-domain.com
   ```

   Then set `VITE_EMAIL_FUNCTION_URL` to the function URL.

Without step 7 the confirmation screen still works — it shows a `mailto:` fallback instead of
claiming an email was sent.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server on port 5173 — serves **both** apps from one origin |
| `npm run build` | Type-check (`tsc`) + all three outputs: `dist/` (both apps), `dist/site`, `dist/portal` |
| `npm run build:site` | Public website only → `dist/site` (for a separate deployment) |
| `npm run build:portal` | Portal only → `dist/portal` (for a separate deployment) |
| `npm run preview` | Serve `dist/` on port 4173 |
| `npm run typecheck` | TypeScript check only |

> **One origin or two?** `dist/` holds both apps behind one domain (default, and what
> `npm run dev` / `npm run preview` use) — portal routes such as `/login` and `/dashboard` are
> rewritten to `portal.html` by [`vercel.json`](vercel.json) / [`firebase.json`](firebase.json)
> or the dev middleware in [`vite.config.ts`](vite.config.ts). Use `dist/site` + `dist/portal`
> only when you host them on two domains, and set `VITE_PORTAL_URL` / `VITE_SITE_URL`
> accordingly. A two-domain deployment needs Supabase — localStorage demo mode only works while
> both apps share an origin.

### End-to-end smoke test

A Playwright script walks the whole product — booking flow, confirmation, tracking,
designer login, pool claim, status change, dashboard edits, contact form, signup,
404 and mobile nav — and fails on any assertion or console error:

```bash
python -m pip install playwright && playwright install chromium
npm run build
python <webapp-testing>/scripts/with_server.py --server "npm run preview" \
  --port 4173 -- python e2e/smoke.py
```

40 checks must pass with `0 failure(s), 0 console error(s)`.

---

## Project structure

```
duo-pixel-agency/
├── index.html                 # entry #1 — public website
├── portal.html                # entry #2 — client & designer portal
├── vite.config.ts             # dev server + combined build (portal route rewrite)
├── vite.site.config.ts        # standalone build → dist/site
├── vite.portal.config.ts      # standalone build → dist/portal
├── public/
│   ├── favicon.svg            # two overlapping pixel squares
│   └── og.svg                 # social share image
├── site/                      # WEBSITE 1 — public marketing + booking
│   └── src/
│       ├── App.tsx            # public routes
│       ├── main.tsx           # bootstrap (BrowserRouter + AuthProvider)
│       ├── components/Layout.tsx   # navbar (mobile drawer) + footer
│       └── pages/             # Home, Designers, DesignerProfile, Pricing,
│                              # Contact, Book, Confirmation, NotFound
├── portal/                    # WEBSITE 2 — tracking + accounts + dashboard
│   └── src/
│       ├── App.tsx            # portal routes + auth guards
│       ├── main.tsx           # bootstrap
│       ├── components/PortalLayout.tsx  # compact chrome, "back to site"
│       └── pages/             # Track, Login, Signup, MyBookings,
│                              # Dashboard, DashboardBooking, NotFound
├── shared/                    # used by both apps (alias `@/`)
│   ├── index.css              # Tailwind + design tokens
│   ├── components/            # Logo, Avatar, ProjectArt, cards, fields, ui
│   └── lib/
│       ├── links.ts           # portalUrl() / siteUrl() between the two apps
│       ├── supabase.ts        # client (enabled only when env is set)
│       ├── db.ts              # data layer: Supabase ⇄ localStorage
│       ├── auth.tsx           # Supabase Auth ⇄ local demo auth
│       ├── seed.ts            # all editable content
│       ├── format.ts          # IDs, INR, WhatsApp/mailto links
│       └── useDesigners.ts    # live hooks over designers/packages/reviews
├── supabase/
│   ├── schema.sql             # tables + RLS + storage + realtime
│   ├── seed.sql               # designers, packages, reviews
│   └── functions/send-booking-email/index.ts
├── e2e/smoke.py               # 40-check Playwright suite
└── vercel.json / firebase.json
```

---

## The booking flow

1. **Choose a designer** — Markanti, Sundar, or *No preference*.
2. **Website type** — landing page, business, portfolio, e-commerce, web app, college/event
   portal, other.
3. **Project details** — name, description, pages, feature checkboxes, style preferences,
   reference links, optional file uploads.
4. **Budget, deadline, communication language** (+ optional package).
5. **Contact details** — name, phone/WhatsApp, email, preferred contact method.
6. **Review & submit** → booking saved as **Pending** with a `DPA-XXXXXX` ID → confirmation
   page with WhatsApp deep link, copy button and email status.

After that:

- Client tracks at `/track` with **booking ID + phone number** (no account needed), or in
  **My Bookings** when logged in.
- Designer sees it in the **Unassigned pool**, clicks *Accept & assign to me*, then moves it
  through the statuses. Every change is appended to the client's timeline in realtime.
- When a project is **Completed**, the client can leave a rating and review from
  *My Bookings*; it appears in the designer's Reviews tab.

---

## Accounts

Accounts live in the **portal** app (`/login`). **Local demo mode** (no Supabase configured) —
shown on the login screen:

| Role | Email | Password |
| --- | --- | --- |
| Designer (Markanti) | `markanti@duopixel.agency` | `designer123` |
| Designer (Sundar) | `sundar@duopixel.agency` | `designer123` |
| Client | sign up with any email | any 8+ characters |

---

## Deployment

### Option A — one domain (default, recommended)

Both apps ship in a single `dist/`: the website at `/` and the portal behind `/login`,
`/signup`, `/track`, `/account/*` and `/dashboard/*`.

```bash
npm run build          # dist/ (both apps) + dist/site + dist/portal
vercel --prod          # or: firebase deploy --only hosting
```

[`vercel.json`](vercel.json) and [`firebase.json`](firebase.json) already contain the portal
rewrites, the SPA fallback and immutable asset caching. Leave `VITE_PORTAL_URL` and
`VITE_SITE_URL` **empty** — everything is same-origin, so localStorage demo mode keeps working
even without Supabase.

### Option B — two separate domains

Build each app on its own and point them at each other:

```bash
# website project          → dist/site
# portal project           → dist/portal
npm run build:site
npm run build:portal
```

| Project | Build command | Output directory | Env vars |
| --- | --- | --- | --- |
| Public website | `npm run build:site` | `dist/site` | `VITE_PORTAL_URL=https://app.yourdomain.com` |
| Portal | `npm run build:portal` | `dist/portal` | `VITE_SITE_URL=https://yourdomain.com` |

Each variable holds the **other** app's origin. Because the two domains no longer share
`localStorage`, **Supabase is required** in this mode.

### Firebase Hosting (single domain)

```bash
npm i -g firebase-tools
firebase login
# put your project id in .firebaserc
npm run build
firebase deploy --only hosting
```

### After deploying

- Set the production `VITE_*` values on the host, then rebuild.
- Add **both** production URLs to Supabase **Authentication → Redirect URLs**.
- Point your domain at the host and update `VITE_SITE_URL` / `VITE_PORTAL_URL` if you split
  the apps across two domains.

---

## Environment variables

| Key | Required | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | for production | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | for production | Supabase anon key |
| `VITE_SITE_URL` | only if split | The **portal's** origin when the apps live on two domains (leave empty for one origin) |
| `VITE_PORTAL_URL` | only if split | The **website's** origin when the apps live on two domains (leave empty for one origin) |
| `VITE_EMAIL_FUNCTION_URL` | optional | Edge function that sends confirmation email |
| `VITE_WHATSAPP_NUMBER` | recommended | Agency WhatsApp number (E.164, no `+`) |
| `VITE_CONTACT_EMAIL` | recommended | Public contact email |

Empty Supabase values ⇒ the app runs in local demo mode instead of failing.

---

## Customising the site

- **Copy, packages, services, FAQ, testimonials, portfolio** — [`shared/lib/seed.ts`](shared/lib/seed.ts)
  (designers, packages and reviews are *also* stored in Supabase so they can be edited from
  the dashboard).
- **Colours & fonts** — `tailwind.config.ts` (`accent` is the single bold accent colour;
  `ink` is the dark palette). Fonts load from Google Fonts in `index.html` and `portal.html`.
- **Logo** — `shared/components/Logo.tsx` and `public/favicon.svg` (same two-square mark).
- **Contact details** — `VITE_WHATSAPP_NUMBER`, `VITE_CONTACT_EMAIL`, and `AGENCY` in
  `shared/lib/seed.ts`.
- **Feature / budget / deadline options** — bottom of `shared/lib/seed.ts`.
- **Links between the two apps** — `shared/lib/links.ts` (`portalUrl()` / `siteUrl()`).

---

MIT © Duo Pixel Agency
