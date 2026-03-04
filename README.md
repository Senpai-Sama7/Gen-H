# Money Monorepo - AI Handoff and Operating Guide

This repository contains three distinct systems:

1. `genh-premium-site/` - the live public-facing Next.js/Vercel website for GEN-H Studio
2. `hvac-lead-generator/` - a lead-generation platform (Python + API + dashboard)
3. `hvac-template-library/` - an HVAC template/CMS platform (Next.js + Express + Docker)

This document is the top-level handoff. It is written so another engineer or AI agent can enter the repo, understand the architecture, avoid the known traps, and continue work without rediscovering context.

## Current Source of Truth

The primary active production app is:

- `genh-premium-site/`

The current public domain is:

- `https://gen-h.vercel.app`

The root of the repo also matters in production:

- `vercel.json` at the repo root is a deliberate safety shim
- it rewrites all traffic for the separate Vercel project `gen-h` to `https://genh-premium-site.vercel.app`

Do not remove `vercel.json` unless the Vercel project named `gen-h` is reconfigured to build `genh-premium-site/` directly. Without that file, `gen-h.vercel.app` can revert to a 404 when the wrong Vercel project auto-deploys.

## Repository Layout

### Active production website

- `genh-premium-site/`
  - `app/` - Next.js App Router routes
  - `components/` - reusable UI components
  - `lib/` - auth, storage, notifications, shared types
  - `data/` - local dev JSON storage fallback
  - `.env.example` - required runtime variables
  - `README.md` - app-specific deployment notes

### HVAC lead generation platform

- `hvac-lead-generator/`
  - `lead_generator.py` - Composio-backed lead generation CLI
  - `api/` - API wrapper around the generator and artifact history
  - `dashboard/` - Next.js operator dashboard
  - `artifacts/` - JSON run outputs
  - `.venv/` - Python virtual environment

### HVAC template platform

- `hvac-template-library/`
  - `api-gateway/` - Express API
  - `cms/` - Next.js CMS
  - `shared/` - shared React components
  - `database/` - schema
  - `docker/` - Docker Compose stack
  - `docs/` - supporting docs

### Root-level operational files

- `vercel.json` - root Vercel rewrite shim for the `gen-h` project
- `start-all.sh` - convenience local startup script for HVAC systems
- `stop-all.sh` - convenience local shutdown script for HVAC systems
- `.github/workflows/genh-premium-site.yml` - CI build for the premium site

## System 1: GEN-H Premium Site

### Purpose

`genh-premium-site/` is a full-stack marketing and lead-intake website for GEN-H Studio:

- public landing page
- public inquiry submission form
- protected admin portal at `/portal`
- protected admin dashboard at `/portal/dashboard`
- inquiry persistence
- operator notes and status management

### Live behavior

Public:

- `GET /` - renders the main marketing site
- `POST /api/inquiries` - creates a new inquiry
- `GET /api/health` - health summary
- `GET /api/readiness` - deployment readiness summary

Protected:

- `GET /portal` - login screen
- `GET /portal/dashboard` - admin dashboard (requires login session)
- `GET /api/inquiries` - query inquiries (requires session)
- `PATCH /api/inquiries/:id` - update inquiry status/notes (requires session)
- `GET /ops` - legacy path, redirects to `/portal/dashboard`

### Runtime architecture

- Framework: Next.js App Router
- Frontend: React + TSX
- Storage:
  - local development: JSON file under `genh-premium-site/data/inquiries.json`
  - production: Vercel Blob snapshots via `@vercel/blob`
- Auth:
  - session-cookie login portal
  - middleware-protected admin routes and admin APIs
- Optional notifications:
  - Resend email notifications on new inquiry

### Critical implementation details

#### Root Vercel deployment workaround

There are two Vercel projects:

- `genh-premium-site` - the real app project
- `gen-h` - a separate project that historically deployed the repo root incorrectly

The fix that currently keeps the live domain stable is:

- root `vercel.json` rewrites every request from `gen-h` to `genh-premium-site.vercel.app`

This is not decorative. It is currently the guardrail preventing the public domain from flipping back to 404 after repo pushes.

#### Auth model

Portal login uses:

- `OPS_BASIC_USER`
- `OPS_BASIC_PASS`
- optional `OPS_SESSION_SECRET`

Implementation is in:

- `genh-premium-site/lib/auth.ts`

Current limitation:

- session tokens are deterministic hashes, not fully signed expiring server-validated sessions
- this works, but it is weaker than a proper JWT or signed timestamped cookie

If security hardening continues, this is one of the first code paths to replace.

#### Storage model

Production writes immutable snapshot objects to Vercel Blob.

This means:

- writes return a `snapshotPath`
- some admin flows should prefer exact-snapshot reads for consistency
- the operator desk is designed around this model

### Required environment variables for production

Core:

- `BLOB_READ_WRITE_TOKEN`
- `INQUIRY_BLOB_PATH`
- `OPS_BASIC_USER`
- `OPS_BASIC_PASS`
- `OPS_SESSION_SECRET`
- `NEXT_PUBLIC_SITE_URL`

Optional but recommended:

- `RESEND_API_KEY`
- `ALERT_EMAIL`
- `FROM_EMAIL`
- `COMPANY_PHONE`
- `COMPANY_EMAIL`

### Known gaps / technical debt

- Public inquiry endpoint has no rate limiting or bot protection
- Session cookies should be upgraded to signed expiring sessions
- `launchReady` may be more permissive than some operators want because alerts are optional
- Notifications are skipped if Resend is not configured

### Local development

```bash
cd genh-premium-site
npm install
npm run dev
```

For a production-style local check:

```bash
cd genh-premium-site
npm run build
npm run start
```

### High-signal files

- `genh-premium-site/app/page.tsx` - public landing page
- `genh-premium-site/app/portal/page.tsx` - login route
- `genh-premium-site/app/portal/dashboard/page.tsx` - admin dashboard route
- `genh-premium-site/components/ops-desk.tsx` - admin workspace UI
- `genh-premium-site/components/contact-form.tsx` - inquiry intake form
- `genh-premium-site/components/revenue-visualizer.tsx` - interactive visual element
- `genh-premium-site/app/api/inquiries/route.ts` - create/list inquiries
- `genh-premium-site/app/api/inquiries/[id]/route.ts` - update inquiry
- `genh-premium-site/app/api/readiness/route.ts` - deployment readiness API
- `genh-premium-site/app/api/health/route.ts` - health API
- `genh-premium-site/lib/inquiries.ts` - persistence layer
- `genh-premium-site/lib/auth.ts` - session helpers
- `genh-premium-site/middleware.ts` - route protection

## System 2: HVAC Lead Generator

### Purpose

`hvac-lead-generator/` finds HVAC leads, writes run artifacts, supports preview/export modes, and exposes a non-technical dashboard around the generator.

### Main components

- `lead_generator.py` - primary CLI
- `api/server.ts` - backend wrapper for generator execution, artifacts, readiness, history, and CRM promotion
- `dashboard/pages/index.tsx` - operator UI

### Runtime capabilities

CLI modes:

- default run - generate + export
- `--profile-locations` - scan locations and show qualified count
- `--dry-run` - find leads without writing to the sheet
- `--output-json <path>` - persist the current run artifact

Operational features already implemented:

- retry/backoff around Composio action execution
- JSON artifact generation
- artifact history
- download audit JSON
- promote artifact into CRM
- duplicate-promotion protection
- run-history filters and sort
- production readiness panel
- execution preflight guard

### Dependencies

- Python runtime from `.venv`
- Composio account + valid `COMPOSIO_API_KEY`
- `COMPOSIO_ENTITY_ID`
- active connected apps:
  - `google_maps`
  - `googlesheets`

### Required environment

See:

- `hvac-lead-generator/.env.example`

Core values include:

- `COMPOSIO_API_KEY`
- `COMPOSIO_ENTITY_ID`
- `target_locations`
- `min_rating`
- `min_review_count`
- `results_per_location`
- `google_sheet_id`
- `LEAD_API_PORT`
- `LEAD_DATABASE_URL`

### Database behavior

- uses the shared Postgres instance
- campaign records go to `lead_campaigns`
- promoted leads go to `leads`
- API startup applies compatibility migrations for duplicate-promotion safety

### Important notes

- The system has been validated with live Composio + Google Sheets writes
- Artifacts are stored under `hvac-lead-generator/artifacts/`
- The dashboard is designed for non-technical operators and already exposes:
  - config
  - profile
  - preview
  - generate/export
  - history
  - download
  - promote
  - readiness
  - CRM panel

### High-signal files

- `hvac-lead-generator/lead_generator.py`
- `hvac-lead-generator/api/server.ts`
- `hvac-lead-generator/dashboard/pages/index.tsx`
- `hvac-lead-generator/.env.example`
- `hvac-lead-generator/requirements.txt`

## System 3: HVAC Template Library

### Purpose

`hvac-template-library/` is a full-stack template/CMS system for deploying HVAC company websites from prebuilt templates.

### Main components

- `api-gateway/` - Express API
- `cms/` - Next.js management UI
- `shared/` - reusable components
- `database/schema.sql` - template and lead schemas
- `docker/docker-compose.yml` - local stack

### Local services

- CMS: `http://localhost:3000`
- API: `http://localhost:5000`
- Postgres: `localhost:5432`
- Redis: `localhost:6379`

### High-signal files

- `hvac-template-library/database/schema.sql`
- `hvac-template-library/api-gateway/server.ts`
- `hvac-template-library/cms/pages/index.tsx`
- `hvac-template-library/shared/components/index.ts`
- `hvac-template-library/docker/docker-compose.yml`

## Local Development Workflows

### HVAC systems startup

```bash
./start-all.sh
```

This is for the HVAC systems (`hvac-template-library` and `hvac-lead-generator`), not the Vercel site.

Shutdown:

```bash
./stop-all.sh
```

### GEN-H site local startup

```bash
cd genh-premium-site
npm install
npm run dev
```

### CI

Current CI only covers the premium site build:

- `.github/workflows/genh-premium-site.yml`

## Deployment Notes

### GEN-H production deployment

There are two deployment layers:

1. `genh-premium-site` Vercel project - the real app
2. `gen-h` Vercel project - root proxy safety layer

The current stable setup is:

- `genh-premium-site` hosts the app
- repo root `vercel.json` rewrites all `gen-h` traffic to that app

This means future repo pushes should not break `https://gen-h.vercel.app`, even if the `gen-h` project continues to build the repo root.

### If the live site breaks again

Check these first:

1. `curl -I https://gen-h.vercel.app/`
2. `curl -s https://gen-h.vercel.app/api/health`
3. `npx vercel inspect gen-h.vercel.app`
4. `npx vercel inspect genh-premium-site.vercel.app`

If `gen-h` is returning 404 again, likely causes are:

- root `vercel.json` was removed or changed
- the `genh-premium-site` project is down
- the external rewrite target changed

### Manual recovery path

If needed, redeploy the root project:

```bash
npx vercel link --project gen-h --yes --scope senpai-sama7s-projects
npx vercel deploy --prod --yes --scope senpai-sama7s-projects --logs
```

This deploys the root rewrite shim, which should restore `gen-h.vercel.app`.

## Security / Operational Warnings

- Never commit real secrets
- `.vercel` and local env files are intentionally ignored
- Public intake endpoints are internet-facing and currently not throttled
- Admin auth works but should be hardened further if the app will handle sensitive data
- Vercel Blob is the production data store; if the token is removed, the site will still render but intake persistence can fail or block depending on route logic

## Recommended Next Hardening Tasks

These are the highest-value remaining improvements:

1. Replace deterministic portal session cookies with signed expiring sessions
2. Add rate limiting / bot protection to `POST /api/inquiries`
3. Add production analytics and error monitoring
4. Add role-based settings UI inside the portal
5. Add stronger backup/export tooling for inquiry data

## For the Next AI Agent

If you are continuing work, use this order:

1. Treat `genh-premium-site/` as the primary active product
2. Preserve root `vercel.json` unless you explicitly replace the root-project deployment model
3. Verify the live site first:
   - `https://gen-h.vercel.app`
   - `https://gen-h.vercel.app/api/health`
4. Then verify local build:
   - `cd genh-premium-site && npm run build`
5. Only after that, make changes

If a deployment issue appears, do not assume the app is broken. Check whether the separate `gen-h` root Vercel project is the actual cause before changing application code.
