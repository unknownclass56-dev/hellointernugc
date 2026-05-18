
# UGC INTERN — Build Plan

## Architecture

```text
┌─────────────────────────┐      ┌──────────────────────┐      ┌──────────────────┐
│ Frontend (this project) │ ───► │ Your Express backend │ ───► │ Your Supabase    │
│ TanStack Start + React  │      │ (scaffolded in       │      │ Postgres / Auth  │
│ Tailwind + Framer       │      │  /backend folder)    │      │ / Storage        │
└─────────────────────────┘      └──────────────────────┘      └──────────────────┘
        │                                                                  ▲
        └────── Supabase Auth + direct reads (RLS-protected) ──────────────┘
```

- **Built and deployed from Lovable**: the React frontend only.
- **Delivered as code in `/backend`** (you deploy on Render/Railway/your VPS): Node + Express + Supabase service-role client. Dockerfile + README included.
- **You provision**: the Supabase project. SQL schema + RLS policies will be in `/backend/sql/` ready to run.

## Pages (15)

Public:
1. `/` — Home (hero with logo + illustration, stats counters, program highlights, partners, testimonials, CTA)
2. `/about`
3. `/programs` — Internship Programs index
4. `/programs/aicte`, `/programs/ugc`, `/programs/bsdm`, `/programs/iso` — accreditation pages
5. `/internships` — listing with search + category/duration/mode filters
6. `/internships/$id` — detail + Apply CTA
7. `/apply/$id` — application form (resume upload to Supabase Storage)
8. `/verify` — Certificate verification by unique ID
9. `/blog` + `/blog/$slug` — News/blog
10. `/faq` — Accordion
11. `/contact` — Form → `contact_messages`

Auth:
12. `/login`, `/register`, `/forgot-password`, `/reset-password` (role-aware: student / company)

Authed (under `_authenticated/`):
13. `/dashboard/student` — profile, applications, certificates, downloads
14. `/dashboard/company` — post internships, manage applicants
15. `/dashboard/admin` — users, companies, internships approval, certificate issuance, contact inbox, analytics, CSV export

## Design System

- Colors (CSS tokens in `src/styles.css`, OKLCH): `--navy` (deep dark blue, primary), `--gold` (accent), `--ivory` (background), plus muted/foreground/border. Glass surface tokens for cards.
- Typography: Playfair Display (display) + Inter (body) — government-formal pairing.
- Motion: Framer Motion for hero, section reveals, dashboard stat counters, accordion, page transitions.
- Components: shadcn/ui (already in repo) re-themed; reusable `GlassCard`, `StatCounter`, `SectionHeader`, `ApprovalBadge`, `Footer`.
- Logo: `src/assets/ugc-intern-logo.png` (already added) used in nav, footer, loading screen, and as favicon source.
- Approval badges: AICTE / UGC / BSDM / ISO — placeholder slots wired now; you upload official logo files later (drop into `src/assets/approvals/`).

## Frontend ↔ Backend Contract

All calls go through `src/lib/api.ts`:
```ts
const API = import.meta.env.VITE_API_BASE_URL  // e.g. https://api.ugcintern.in
api.get('/internships', { q, category })
api.post('/applications', { internshipId, resumeUrl, coverLetter })
```
Auth: Supabase session JWT sent as `Authorization: Bearer <token>`; Express verifies with Supabase JWKS.

## Backend Scaffold (`/backend`)

Express + TypeScript. Routes:
- `auth/*` — register profile (after Supabase signup), role assignment
- `students/*`, `companies/*` — profile CRUD
- `internships/*` — list, get, create (company), approve (admin), update, delete
- `applications/*` — apply, list mine, list by internship (company), update status (company/admin)
- `certificates/*` — issue (admin), download (PDF via `pdfkit`), verify by ID (public)
- `contact/*` — submit, list (admin)
- `admin/*` — users, analytics, CSV export
- `email/*` — internal trigger; uses Nodemailer (SMTP config via env)

Middleware: JWT verify, role guard, Zod validation, rate limit, CORS.

Email templates (Handlebars): registration, application confirmation, status change, certificate issued, forgot password, admin notifications. Senders: support@ / help@ / admin@ugcintern.in (you configure SMTP).

## Database (`/backend/sql/`)

Tables: `profiles` (1:1 auth.users), `user_roles` (separate, has_role() function — never on profiles), `students`, `companies`, `internships`, `applications`, `certificates` (with `verification_id` unique), `notifications`, `testimonials`, `contact_messages`, `blog_posts`, `faqs`. Storage buckets: `resumes` (private), `certificates` (private), `company-logos` (public), `blog-media` (public). Full RLS policies included.

## Secrets You'll Need to Add

Frontend (now):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL` (your deployed Express URL; can be `http://localhost:4000` during dev)

Backend (you set on your host, not here):
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWKS_URL`
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`
- `JWT_AUDIENCE`, `CORS_ORIGIN`

## What You'll Get on First Build

1. All 15 pages, fully designed and responsive (mobile-first, tablet, desktop).
2. Supabase Auth wired (email/password + Google ready to enable).
3. Frontend dashboards rendering live data from your Express API (with mocked fallback if API not yet deployed, so you can preview immediately).
4. Complete `/backend` Express app + `Dockerfile` + `README.md` with deploy instructions for Render and Railway.
5. Complete SQL migration file + RLS policies in `/backend/sql/0001_init.sql`.
6. AI chatbot section component (UI only; you'll plug in your provider).
7. Favicon generated from your logo.
8. SEO: per-route head meta, JSON-LD Organization, sitemap stub.

## What's Out of Scope for v1 (will need follow-ups)

- Actual SMTP credentials & sending (you provide; backend is wired to send).
- Real chatbot LLM integration (UI shell ready).
- Payment/fees if any.
- Granular analytics charts beyond basic counts.
- Replacing approval badge placeholders with your official logo files.

## Build Order (single pass)

1. Design tokens + base layout (nav, footer with disclaimer text, page shell)
2. Public pages 1–11 with all sections (banners, counters, testimonials, partners, FAQ, certificates showcase)
3. Supabase client + auth pages + role-aware redirect
4. `_authenticated` guard + 3 dashboards
5. Apply flow + resume upload + verification page
6. `/backend` Express scaffold + SQL + Dockerfile + README
7. Favicon + meta + final QA pass

This will be a long build with many files. Expect a polished v1 that needs iteration on real data, copy, and the approval logos once you provide them.
