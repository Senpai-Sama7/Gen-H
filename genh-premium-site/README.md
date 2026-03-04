# GEN-H Premium Site

A Vercel-ready Next.js full-stack marketing site for premium HVAC growth systems.

## What is included

- Editorial-grade premium TSX frontend
- Server-rendered inquiry dashboard on the homepage
- Login-based admin portal at `/portal`
- `POST /api/inquiries` with schema validation
- `GET /api/inquiries` for operational inspection
- `GET /api/health` for deployment checks
- `GET /api/readiness` for launch-readiness checks
- Local JSON persistence for development
- Vercel Blob support for production persistence

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production deployment on Vercel

1. Import `genh-premium-site` as a new Vercel project.
2. Add these environment variables:
   - `BLOB_READ_WRITE_TOKEN`
   - `INQUIRY_BLOB_PATH` (recommended so the Blob snapshot prefix is not guessable)
   - `OPS_BASIC_USER`
   - `OPS_BASIC_PASS`
   - `OPS_SESSION_SECRET` (recommended so portal sessions are independent of the raw login password)
   - `RESEND_API_KEY` (recommended)
   - `ALERT_EMAIL` (recommended)
   - `NEXT_PUBLIC_SITE_URL`
   - `COMPANY_PHONE` (optional)
   - `COMPANY_EMAIL` (optional)
3. Deploy.

The repository also includes `vercel.json` with security headers and a GitHub Actions workflow at `.github/workflows/genh-premium-site.yml` that runs a production build on every push or pull request affecting this app.

Without Vercel Blob, the frontend still renders, but inquiry submissions are blocked in production by design. For Vercel Blob, this app writes immutable JSON snapshots under a single prefix and reads the latest snapshot, so use a randomized `INQUIRY_BLOB_PATH` value in production.

## Admin portal

- Visit `/portal` to sign in
- Successful login creates a secure session cookie and redirects to `/portal/dashboard`
- `/ops` now redirects to `/portal/dashboard`
- `GET /api/inquiries` requires a valid portal session
- `PATCH /api/inquiries/:id` requires a valid portal session
- `POST /api/inquiries` remains public so the homepage intake form continues to work
- Operators can update lead status (`new`, `qualified`, `booked`) and attach notes directly from the dashboard

## Email notifications

- If `RESEND_API_KEY` and `ALERT_EMAIL` are configured, every new inquiry triggers an email notification
- If those variables are missing, inquiry capture still succeeds and the UI reports that notifications are skipped

## API contracts

### `POST /api/inquiries`
Creates an inquiry record.

### `GET /api/inquiries`
Returns the latest inquiry records.

### `GET /api/health`
Returns runtime health and storage mode.

### `GET /api/readiness`
Returns a structured deployment-readiness report, including whether the app is ready for deploy and launch.
