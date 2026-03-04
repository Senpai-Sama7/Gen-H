# AGENTS.md - AI Agent Operating Guidelines

> **For AI Agents**: This file is the authoritative source for working in this monorepo. Read it before making changes. When uncertain, consult this document first.

## Table of Contents

1. [Repository Overview](#1-repository-overview)
2. [System Architecture](#2-system-architecture)
3. [Build Commands](#3-build-commands)
4. [Development Workflow](#4-development-workflow)
5. [Code Style Guidelines](#5-code-style-guidelines)
6. [Testing Strategy](#6-testing-strategy)
7. [Security Guidelines](#7-security-guidelines)
8. [API Design Standards](#8-api-design-standards)
9. [Database Conventions](#9-database-conventions)
10. [Deployment & Operations](#10-deployment--operations)
11. [Troubleshooting](#11-troubleshooting)
12. [Common Pitfalls](#12-common-pitfalls)

---

## 1. Repository Overview

This monorepo contains three production systems maintained by the same team:

| System | Type | Primary Use |
|--------|------|-------------|
| `genh-premium-site/` | Next.js App Router | Public marketing site + admin portal |
| `hvac-lead-generator/` | Express + Next.js + Python | Lead generation CRM platform |
| `hvac-template-library/` | Next.js + Express | HVAC website template CMS |

### Primary Production System

**`genh-premium-site/`** is the live production application. All agentic work should prioritize this system unless explicitly instructed otherwise.

- **Production URL**: https://gen-h.vercel.app
- **Status Endpoint**: https://gen-h.vercel.app/api/health

### Repository Root Files

| File | Purpose |
|------|---------|
| `vercel.json` | Critical safety shim - **DO NOT REMOVE** |
| `start-all.sh` | Local startup for HVAC systems |
| `tsconfig.json` | Root TypeScript configuration |

---

## 2. System Architecture

### 2.1 GEN-H Premium Site Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     genh-premium-site/                          │
├─────────────────────────────────────────────────────────────────┤
│  Public Layer                    │  Protected Layer            │
│  ─────────────────               │  ──────────────             │
│  GET /                          │  GET /portal                 │
│  POST /api/inquiries            │  GET /portal/dashboard       │
│  GET /api/health                │  GET /api/inquiries (auth)   │
│  GET /api/readiness             │  PATCH /api/inquiries/:id    │
│                                  │  GET /ops (redirects)        │
├─────────────────────────────────────────────────────────────────┤
│  Storage Strategy                                                 │
│  ───────────────                                                 │
│  Development: JSON file (data/inquiries.json)                  │
│  Production:  Vercel Blob (@vercel/blob)                       │
├─────────────────────────────────────────────────────────────────┤
│  Security Features                                               │
│  ───────────────                                                 │
│  • Security headers (CSP, HSTS, X-Frame-Options)              │
│  • Rate limiting on public endpoints                           │
│  • Input sanitization utilities                                 │
│  • Environment validation                                       │
│  • Structured logging                                           │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 HVAC Lead Generator Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   hvac-lead-generator/                          │
├─────────────────────────────────────────────────────────────────┤
│  Components:                                                    │
│  ───────────                                                    │
│  • lead_generator.py    - Composio-backed CLI                  │
│  • api/server.ts        - Express REST API (port 5001)         │
│  • dashboard/           - Next.js operator UI (port 3001)      │
│  • artifacts/           - JSON run outputs                     │
├─────────────────────────────────────────────────────────────────┤
│  Dependencies:                                                  │
│  ───────────                                                   │
│  • Python 3.x with .venv                                        │
│  • Composio (google_maps, googlesheets connected apps)         │
│  • PostgreSQL (shared instance)                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 HVAC Template Library Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                 hvac-template-library/                          │
├─────────────────────────────────────────────────────────────────┤
│  Components:                                                    │
│  ───────────                                                   │
│  • cms/              - Next.js CMS (port 3000)                  │
│  • api-gateway/      - Express API (port 5000)                │
│  • shared/           - Reusable React components               │
│  • database/         - PostgreSQL schemas                       │
│  • docker/           - Docker Compose stack                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Build Commands

### 3.1 GEN-H Premium Site (Primary)

```bash
# ─────────────────────────────────────────────────────────────
# Prerequisites
# ─────────────────────────────────────────────────────────────
# Node.js >= 20.10.0 required
node --version

# Install dependencies
cd genh-premium-site && npm install

# ─────────────────────────────────────────────────────────────
# Development
# ─────────────────────────────────────────────────────────────
npm run dev                    # Start dev server (localhost:3000)
npm run build                  # Production build
npm run start                  # Run production build
npm run check                  # TypeScript type check only
npx tsc --noEmit              # Alternative type check

# ─────────────────────────────────────────────────────────────
# Linting & Formatting
# ─────────────────────────────────────────────────────────────
npm run lint                   # Run ESLint
npm run lint:fix              # Fix ESLint issues
npm run format                # Format with Prettier
npm run format:check          # Check formatting

# ─────────────────────────────────────────────────────────────
# Testing
# ─────────────────────────────────────────────────────────────
npm run test                  # Run Jest tests
npm run test:watch           # Run tests in watch mode
npm run test:coverage        # Run tests with coverage

# ─────────────────────────────────────────────────────────────
# Verification Commands
# ─────────────────────────────────────────────────────────────
# Local health check
curl http://localhost:3000/api/health

# Production health check
curl https://gen-h.vercel.app/api/health
```

### 3.2 HVAC Lead Generator

```bash
# ─────────────────────────────────────────────────────────────
# API Service
# ─────────────────────────────────────────────────────────────
cd hvac-lead-generator/api
npm install
npm run dev                    # Port 5001
npm run build                  # Compile TypeScript
npm run start                  # Run compiled

# ─────────────────────────────────────────────────────────────
# Dashboard Service
# ─────────────────────────────────────────────────────────────
cd hvac-lead-generator/dashboard
npm install
npm run dev                    # Port 3001
npm run build
npm run start
```

### 3.3 HVAC Template Library

```bash
# ─────────────────────────────────────────────────────────────
# CMS
# ─────────────────────────────────────────────────────────────
cd hvac-template-library/cms
npm install
npm run dev                    # Port 3000
npm run build
npm run start

# ─────────────────────────────────────────────────────────────
# API Gateway
# ─────────────────────────────────────────────────────────────
cd hvac-template-library/api-gateway
npm install
npm run dev                    # Port 5000
npm run build
npm run start

# ─────────────────────────────────────────────────────────────
# All Services (requires Docker)
# ─────────────────────────────────────────────────────────────
./start-all.sh                 # Start CMS, API, Postgres, Redis
./stop-all.sh                  # Stop all services
```

---

## 4. Development Workflow

### 4.1 Starting a New Feature

```bash
# 1. Verify current state
git status
git log -3 --oneline

# 2. Verify production is healthy
curl https://gen-h.vercel.app/api/health

# 3. Pull latest changes
git pull origin main

# 4. Install dependencies
cd genh-premium-site && npm install

# 5. Run build to verify compilation
npm run build

# 6. Run type check
npm run check

# 7. Run linting
npm run lint

# 8. Run tests
npm run test

# 9. Start dev server
npm run dev

# 10. Verify local health
curl http://localhost:3000/api/health
```

### 4.2 Making Changes

1. **Before writing code:**
   - Read existing patterns in the relevant system
   - Check `lib/` for shared utilities
   - Review API routes for validation patterns

2. **During development:**
   - Keep TypeScript strict mode happy
   - Use Zod for all API input validation
   - Follow import ordering (see Code Style)
   - Run `npm run lint` frequently

3. **After implementation:**
   - Run `npm run build` - must pass
   - Run `npm run check` - must pass
   - Run `npm run lint` - must pass
   - Run `npm run test` - must pass
   - Test locally with `npm run dev`

### 4.3 Committing Changes

```bash
# Check what changed
git status
git diff

# Stage relevant files
git add path/to/changed/files

# Commit with descriptive message
git commit -m "description of what changed and why"

# Push to remote
git push origin main
```

---

## 5. Code Style Guidelines

### 5.1 Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `OpsDesk`, `ContactForm` |
| Hooks | camelCase with `use` prefix | `useAuth`, `useInquiries` |
| Functions | camelCase | `createInquiry`, `getSession` |
| Variables | camelCase | `isAuthenticated`, `recordCount` |
| Constants | SCREAMING_SNAKE_CASE | `SESSION_COOKIE`, `MAX_BATCH_SIZE` |
| Types/Interfaces | PascalCase | `InquiryRecord`, `ApiResponse` |
| Enums | PascalCase, singular | `InquiryStatus` |
| File (component) | kebab-case | `ops-desk.tsx`, `contact-form.tsx` |
| File (utility) | kebab-case | `auth.ts`, `inquiries.ts` |
| File (config) | kebab-case | `next.config.js` |

### 5.2 Import Organization

**Always** use this exact order:

```typescript
// 1. Next.js / React core (external)
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// 2. Third-party packages (external)
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

// 3. Internal absolute (@/) - lib
import { createInquiry, getStorageMode } from "@/lib/inquiries";
import { notifyNewInquiry } from "@/lib/notifications";

// 4. Internal absolute (@/) - components
import { OpsDesk } from "@/components/ops-desk";
import { ContactForm } from "@/components/contact-form";

// 5. Relative imports (same package)
import { SESSION_COOKIE } from "../../lib/auth";
import { Button } from "../ui/button";
```

### 5.3 Formatting Standards

| Rule | Standard |
|------|----------|
| Indentation | 2 spaces (no tabs) |
| Quotes (TS) | Single quotes `'` |
| Quotes (JSX) | Double quotes `"` |
| Trailing commas | Always |
| Semicolons | Always |
| Line length | ~100 characters (soft) |
| Blank lines | Single blank line between logical groups |

```typescript
// ✅ Correct
export async function createInquiryRecord(
  input: InquiryInput
): Promise<{ record: InquiryRecord; snapshotPath: string }> {
  const id = crypto.randomUUID();
  const record: InquiryRecord = {
    id,
    ...input,
    createdAt: new Date().toISOString(),
    status: "new",
    notes: "",
  };

  return { record, snapshotPath };
}

// ❌ Incorrect
export async function createInquiryRecord(input: InquiryInput) {
  const id = crypto.randomUUID();
  const record: InquiryRecord = { id, ...input, createdAt: new Date().toISOString(), status: "new", notes: "" };
  return { record };
}
```

### 5.4 TypeScript Standards

#### Return Types (Required for Exports)

```typescript
// ✅ Required for exported functions
export function getPortalUsername(): string {
  return process.env.OPS_BASIC_USER?.trim() ?? "";
}

// ✅ Required for exported functions
export async function createSessionToken(): Promise<string> {
  const payload = new TextEncoder().encode("...");
  const digest = await crypto.subtle.digest("SHA-256", payload);
  return bytesToHex(new Uint8Array(digest));
}

// ✅ Internal functions - return type optional but preferred
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
```

#### Error Handling

```typescript
// ✅ Always use type guard for caught errors
catch (error) {
  const message = error instanceof Error ? error.message : "Unexpected server error.";
  return NextResponse.json(
    { success: false, message },
    { status: 503 }
  );
}

// ✅ Custom error classes for API routes
class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
}

// ✅ Using custom error class
throw new HttpError(404, "Inquiry not found");
```

#### Type Annotations

```typescript
// ✅ Use interfaces for object shapes
interface InquiryRecord {
  id: string;
  name: string;
  status: InquiryStatus;
  createdAt: string;
}

// ✅ Use unknown for generic catches, narrow with guards
function processError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error occurred";
}

// ✅ Use optional chaining and nullish coalescing
const snapshotPath = result.snapshotPath ?? undefined;
const name = record?.name ?? "Unknown";
```

### 5.5 React/Next.js Standards

#### Server Components by Default

```typescript
// ✅ Default - Server Component
export default async function DashboardPage() {
  const data = await fetchData();
  return <Dashboard data={data} />;
}

// ✅ Only use "use client" when needed
"use client";

import { useState } from "react";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // ...
}
```

#### Dynamic Routes

```typescript
// ✅ Always mark API routes as dynamic
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // This route will not be statically generated
}
```

#### Zod Validation Patterns

```typescript
// ✅ Always use Zod for API input validation
const inquirySchema = z.object({
  name: z.string().min(2).max(80),
  company: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(30),
  projectType: z.string().min(2).max(60),
  budgetBand: z.string().min(2).max(60),
  launchWindow: z.string().min(2).max(60),
  goals: z.string().min(20).max(1200),
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = inquirySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // parsed.data is now type-safe
  const result = await createInquiry(parsed.data);
  // ...
}
```

### 5.6 Express.js Standards

#### Error Handling

```typescript
// ✅ Centralized error message extraction
const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : "Unknown server error";
};

// ✅ Async route handlers with try/catch
app.get("/api/resource", async (req: Request, res: Response) => {
  try {
    const data = await fetchResource();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

// ✅ Custom error class
class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
```

---

## 6. Testing Strategy

### 6.1 Testing Stack

This project uses Jest with Next.js for testing:

| Layer | Tool | Configuration |
|-------|------|---------------|
| Unit | Jest | `genh-premium-site/__tests__/unit/` |
| Integration | Jest + supertest | `genh-premium-site/__tests__/integration/` |
| Component | @testing-library/react | `genh-premium-site/__tests__/components/` |

### 6.2 Test File Organization

```
genh-premium-site/
├── __tests__/
│   ├── unit/
│   │   ├── auth.test.ts
│   │   └── inquiries.test.ts
│   ├── integration/
│   │   └── api.inquiries.test.ts
│   └── utils/
│       └── sanitize.test.ts
├── jest.config.js          # In package.json
├── jest.setup.ts           # Test setup and mocks
├── package.json
└── ...
```

### 6.3 Test Writing Guidelines

```typescript
// ✅ Use descriptive test names
describe("createInquiry", () => {
  it("should create a new inquiry with generated ID and timestamp", async () => {
    const input: InquiryInput = {
      name: "Acme Corp",
      company: "Acme Inc",
      email: "test@example.com",
      phone: "555-1234",
      projectType: "Website",
      budgetBand: "$5k-$10k",
      launchWindow: "Q1 2024",
      goals: "We need a new website for our business.",
    };

    const result = await createInquiry(input);

    expect(result.record.id).toBeDefined();
    expect(result.record.createdAt).toBeISOString();
    expect(result.record.status).toBe("new");
  });

  it("should throw ValidationError for invalid email", async () => {
    const input = { ...validInput, email: "not-an-email" };

    await expect(createInquiry(input)).rejects.toThrow();
  });
});
```

### 6.4 Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- auth.test.ts

# Run tests matching a pattern
npm run test -- --testNamePattern="createInquiry"
```

---

## 7. Security Guidelines

### 7.1 Never Commit Secrets

```bash
# ✅ Correct: Use .env.example for template
# .env.example
BLOB_READ_WRITE_TOKEN=your_token_here
OPS_BASIC_USER=your_user_here

# ❌ Wrong: Never commit actual secrets
# .env.local (gitignored)
BLOB_READ_WRITE_TOKEN=rl_xxxxxxx
OPS_BASIC_USER=admin
```

### 7.2 Security Headers

The project includes security headers configured in `next.config.js`:

- **Content-Security-Policy (CSP)**: Restricts resource loading
- **X-Content-Type-Options**: Prevents MIME-sniffing
- **X-Frame-Options**: Prevents clickjacking
- **X-XSS-Protection**: XSS filtering
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Controls browser features
- **Strict-Transport-Security (HSTS)**: Forces HTTPS

### 7.3 Rate Limiting

Public API endpoints have rate limiting configured:

```typescript
// Example: Inquiry submission rate limited to 5 requests per minute
const INQUIRY_RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 60 * 1000,
};
```

### 7.4 Input Sanitization

Use the sanitization utilities in `lib/sanitize.ts`:

```typescript
import { sanitizeForHtml, sanitizeEmail, sanitizeObject, validators } from "@/lib/sanitize";

// Sanitize user input
const cleanName = sanitizeForHtml(userInput);

// Validate email
if (!validators.isEmail(email)) {
  return NextResponse.json({ error: "Invalid email" }, { status: 400 });
}

// Sanitize entire object
const cleanData = sanitizeObject(formData, { maxStringLength: 1000 });
```

### 7.5 Environment Validation

Validate environment at startup:

```typescript
import { validateEnvironment, logEnvironmentStatus } from "@/lib/env";

// Run validation
const result = validateEnvironment();

if (!result.valid) {
  console.error("Environment validation failed:", result.errors);
  process.exit(1);
}

// Log warnings
if (result.warnings.length > 0) {
  console.warn("Environment warnings:", result.warnings);
}
```

### 7.6 Structured Logging

Use the logger for consistent logging:

```typescript
import { logger, createLogger, createRequestLogger } from "@/lib/logger";

// Basic logging
logger.info("Operation completed", { userId: "123" });
logger.error("Operation failed", error, { userId: "123" });

// Request logging
export async function GET(request: Request) {
  const requestLogger = createRequestLogger(request);
  requestLogger.start();
  
  try {
    const result = await doSomething();
    requestLogger.complete(200);
    return NextResponse.json(result);
  } catch (error) {
    requestLogger.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

### 7.7 Environment Variables Reference

| Variable | System | Required | Description |
|----------|--------|----------|-------------|
| `BLOB_READ_WRITE_TOKEN` | genh-premium-site | Production | Vercel Blob storage |
| `INQUIRY_BLOB_PATH` | genh-premium-site | Production | Blob path for inquiries |
| `OPS_BASIC_USER` | genh-premium-site | Yes | Portal username |
| `OPS_BASIC_PASS` | genh-premium-site | Yes | Portal password |
| `OPS_SESSION_SECRET` | genh-premium-site | No | Session signing secret |
| `NEXT_PUBLIC_SITE_URL` | genh-premium-site | Production | Public site URL |
| `COMPOSIO_API_KEY` | hvac-lead-generator | Yes | Composio API key |
| `COMPOSIO_ENTITY_ID` | hvac-lead-generator | Yes | Composio entity |
| `LEAD_DATABASE_URL` | hvac-lead-generator | Yes | PostgreSQL connection |

---

## 8. API Design Standards

### 8.1 Response Format

All API responses should follow this structure:

```typescript
// Success response
{
  "success": true,
  "data": { ... },
  "meta": { ... }  // optional
}

// Error response
{
  "success": false,
  "error": "Human-readable message",
  "code": "ERROR_CODE"  // optional
}

// Validation error response
{
  "success": false,
  "errors": {
    "field": ["error message"]
  }
}

// Rate limited response
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```

### 8.2 HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Successful GET/PATCH |
| 201 | Successful POST (created) |
| 400 | Validation error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 412 | Precondition failed |
| 429 | Rate limited |
| 500 | Server error |
| 503 | Service unavailable |

### 8.3 RESTful Conventions

```typescript
// ✅ Resource naming
GET    /api/inquiries          // List
POST   /api/inquiries          // Create
GET    /api/inquiries/:id      // Read
PATCH  /api/inquiries/:id      // Update
DELETE /api/inquiries/:id      // Delete

// ✅ Use plural nouns for collections
/api/inquiries     // ✅
/api/inquiry       // ❌

// ✅ Use nouns not verbs
GET /api/health    // ✅ (exception for system endpoints)
GET /api/inquiries // ✅
POST /api/run      // ❌ - should be /api/generator/run
```

---

## 9. Database Conventions

### 9.1 Connection Handling (Express)

```typescript
// ✅ Use connection pooling
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
});

// ✅ Always release client
async function querySomething() {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT * FROM table");
    return result.rows;
  } finally {
    client.release();
  }
}

// ✅ Use transactions when needed
async function transferLeads() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("INSERT INTO campaigns ...");
    await client.query("INSERT INTO leads ...");
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
```

### 9.2 SQL Patterns

```typescript
// ✅ Parameterized queries (prevent SQL injection)
const result = await pool.query(
  "SELECT * FROM inquiries WHERE status = $1",
  [status]
);

// ✅ Use RETURNING for inserts
const result = await client.query(
  "INSERT INTO table (col) VALUES ($1) RETURNING *",
  [value]
);

// ✅ Add indexes for frequently queried columns
await pool.query(`
  CREATE INDEX idx_inquiries_status ON inquiries(status)
`);
```

---

## 10. Deployment & Operations

### 10.1 Vercel Deployment Safety

**CRITICAL**: The root `vercel.json` is a safety shim:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "https://genh-premium-site.vercel.app/(.*)" }
  ]
}
```

This prevents 404s when the separate `gen-h` Vercel project deploys incorrectly.

**Never remove or modify this file** unless:
1. You reconfigure the `gen-h` Vercel project to build `genh-premium-site/` directly
2. You have coordinated with the team and verified the change

### 10.2 CI/CD Pipeline

The GitHub Actions workflow (`genh-premium-site.yml`) runs:

1. **Lint & Type Check** - ESLint, TypeScript, Prettier
2. **Tests** - Jest with coverage
3. **Build** - Next.js production build
4. **Security Audit** - npm audit
5. **Deploy** - Automatic Vercel deployment on main branch

### 10.3 Deployment Verification

After any deployment:

```bash
# 1. Check main site
curl -I https://gen-h.vercel.app/

# 2. Check health endpoint
curl https://gen-h.vercel.app/api/health

# 3. Check readiness endpoint
curl https://gen-h.vercel.app/api/readiness

# 4. Verify API responds
curl -X POST https://gen-h.vercel.app/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","company":"Test","email":"test@test.com","phone":"555-5555","projectType":"Test","budgetBand":"Test","launchWindow":"Test","goals":"Test goals here"}'
```

### 10.4 Rollback Procedure

If deployment fails:

```bash
# Vercel CLI rollback
npx vercel rollback

# Or via dashboard:
# 1. Go to Vercel dashboard
# 2. Select deployment
# 3. Click "Promote to Production"
```

---

## 11. Troubleshooting

### 11.1 Common Issues

| Issue | Symptom | Solution |
|-------|---------|----------|
| Build fails | `npm run build` error | Check TypeScript errors with `npm run check` |
| Type errors | Red squiggles in IDE | Run `npm run check` to see all errors |
| Lint errors | ESLint warnings/errors | Run `npm run lint:fix` to auto-fix |
| Auth fails | 401 on protected route | Check cookie present, verify `OPS_BASIC_USER/PASS` |
| Storage fails | 503 on POST | Verify `BLOB_READ_WRITE_TOKEN` set in Vercel |
| 404 on production | `gen-h.vercel.app` 404 | Check root `vercel.json` exists |
| Tests fail | Jest errors | Run `npm run test:watch` for debugging |

### 11.2 Health Checks

```bash
# Local development
curl http://localhost:3000/api/health
curl http://localhost:3000/api/readiness

# Production
curl https://gen-h.vercel.app/api/health
curl https://gen-h.vercel.app/api/readiness

# HVAC API
curl http://localhost:5001/health
```

### 11.3 Logs

```bash
# Vercel function logs (CLI)
npx vercel logs genh-premium-site

# Vercel function logs (production)
npx vercel logs genh-premium-site --production

# Application logs (structured logging in production)
# JSON logs are output and can be aggregated via log service
```

---

## 12. Common Pitfalls

### 12.1 Critical Pitfalls (Breaking Changes)

| # | Pitfall | Consequence | Prevention |
|---|---------|-------------|-------------|
| 1 | Remove root `vercel.json` | Production 404 | Never delete, always check before commit |
| 2 | Commit `.env.local` | Secrets exposed | `.env.local` must be in `.gitignore` |
| 3 | Skip input validation | Security vulnerability | Always use Zod schemas |
| 4 | Use `any` type | Type safety lost | Use `unknown` + type guards |
| 5 | Remove `force-dynamic` | Stale cached data | Add to all API routes |
| 6 | Skip linting | Code style issues | Run `npm run lint` before commit |
| 7 | Skip tests | Bugs undetected | Run `npm run test` before commit |

### 12.2 Recommended Practices

```typescript
// ✅ Always add dynamic export
export const dynamic = "force-dynamic";

// ✅ Always validate API input
const parsed = schema.safeParse(payload);
if (!parsed.success) {
  return NextResponse.json({ error: "Invalid input" }, { status: 400 });
}

// ✅ Always handle errors gracefully
catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  return NextResponse.json({ error: message }, { status: 500 });
}

// ✅ Use proper error types
class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// ✅ Type guard for unknown
if (error instanceof Error) { ... }

// ✅ Use sanitization for user input
import { sanitizeForHtml, validators } from "@/lib/sanitize";
const safeInput = sanitizeForHtml(userInput);

// ✅ Use structured logging
import { logger } from "@/lib/logger";
logger.info("Operation completed", { userId, operation });
```

### 12.3 Code Review Checklist

Before submitting changes, verify:

- [ ] `npm run build` passes
- [ ] `npm run check` passes
- [ ] `npm run lint` passes
- [ ] `npm run test` passes
- [ ] No `any` types introduced
- [ ] All API routes have input validation
- [ ] Error handling in place
- [ ] No secrets in code
- [ ] Import order correct
- [ ] Types exported where needed

---

## Appendix: High-Signal Files

When working on each system, prioritize these files:

### GEN-H Premium Site

| File | Purpose |
|------|---------|
| `app/page.tsx` | Public landing page |
| `app/portal/page.tsx` | Login page |
| `app/portal/dashboard/page.tsx` | Admin dashboard |
| `lib/auth.ts` | Session management |
| `lib/inquiries.ts` | Data persistence |
| `lib/types.ts` | TypeScript types |
| `lib/security.ts` | Security utilities (rate limiting, headers) |
| `lib/sanitize.ts` | Input sanitization |
| `lib/logger.ts` | Structured logging |
| `lib/env.ts` | Environment validation |
| `app/api/inquiries/route.ts` | Inquiry CRUD |
| `app/api/inquiries/[id]/route.ts` | Single inquiry |
| `middleware.ts` | Route protection |
| `next.config.js` | Next.js configuration |

### HVAC Lead Generator

| File | Purpose |
|------|---------|
| `api/server.ts` | Express API |
| `lead_generator.py` | Python CLI |
| `dashboard/pages/index.tsx` | Operator UI |

### HVAC Template Library

| File | Purpose |
|------|---------|
| `api-gateway/server.ts` | Express API |
| `cms/pages/index.tsx` | CMS UI |
| `database/schema.sql` | Database schema |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-03 | Initial AGENTS.md | AI Agent |
| 2026-03-03 | Added testing, linting, security utilities | AI Agent |
