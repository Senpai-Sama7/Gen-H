# GEN-H Premium Site

A Vercel-ready Next.js 14 full-stack marketing site for premium HVAC revenue operations.

## What is included

- Editorial-grade premium TSX frontend
- Server-rendered inquiry dashboard on the homepage
- `POST /api/inquiries` with schema validation
- `GET /api/inquiries` for operational inspection
- `GET /api/health` for deployment checks
- Local JSON persistence for development
- Vercel KV support for production persistence

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production deployment on Vercel

1. Import `genh-premium-site` as a new Vercel project.
2. Add these environment variables:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `OPS_BASIC_USER`
   - `OPS_BASIC_PASS`
   - `RESEND_API_KEY` (recommended)
   - `ALERT_EMAIL` (recommended)
   - `NEXT_PUBLIC_SITE_URL`
   - `COMPANY_PHONE` (optional)
   - `COMPANY_EMAIL` (optional)
3. Deploy.

The repository also includes `vercel.json` with security headers and a GitHub Actions workflow at `.github/workflows/genh-premium-site.yml` that runs a production build on every push or pull request affecting this app.

Without Vercel KV, the frontend still renders, but inquiry submissions are blocked in production by design.

## Protected operator desk

- Visit `/ops`
- The route uses HTTP Basic Auth with `OPS_BASIC_USER` and `OPS_BASIC_PASS`
- `GET /api/inquiries` is protected by the same credentials
- `PATCH /api/inquiries/:id` is protected by the same credentials
- `POST /api/inquiries` remains public so the homepage intake form continues to work
- Operators can update lead status (`new`, `qualified`, `booked`) and attach notes directly from `/ops`

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
