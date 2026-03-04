import { NextResponse } from "next/server";
import { z } from "zod";

import { createInquiry, getStorageMode, listInquiriesWithSnapshot } from "@/lib/inquiries";
import { notifyNewInquiry } from "@/lib/notifications";
import { rateLimit, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS } from "@/lib/security";

export const dynamic = "force-dynamic";

// Rate limit settings for this endpoint
const INQUIRY_RATE_LIMIT = {
  maxRequests: 5, // 5 submissions per window
  windowMs: 60 * 1000, // 1 minute
};

// In-memory rate limit store for this endpoint
const inquiryRateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkInquiryRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = inquiryRateLimitMap.get(ip);

  const resetTime = now + INQUIRY_RATE_LIMIT.windowMs;

  if (!record || now > record.resetTime) {
    inquiryRateLimitMap.set(ip, { count: 1, resetTime });
    return { allowed: true, remaining: INQUIRY_RATE_LIMIT.maxRequests - 1, resetTime };
  }

  if (record.count >= INQUIRY_RATE_LIMIT.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  inquiryRateLimitMap.set(ip, record);

  return {
    allowed: true,
    remaining: INQUIRY_RATE_LIMIT.maxRequests - record.count,
    resetTime: record.resetTime
  };
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}

const inquirySchema = z.object({
  name: z.string().min(2).max(80),
  company: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(30),
  projectType: z.string().min(2).max(60),
  budgetBand: z.string().min(2).max(60),
  launchWindow: z.string().min(2).max(60),
  goals: z.string().min(20).max(1200)
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const snapshotPath = searchParams.get("snapshot") ?? undefined;
  const result = await listInquiriesWithSnapshot(10, snapshotPath);

  return NextResponse.json({
    success: true,
    storage: getStorageMode(),
    count: result.records.length,
    records: result.records,
    snapshotPath: result.snapshotPath
  });
}

export async function POST(request: Request) {
  // Rate limiting check
  const clientIp = getClientIp(request);
  const rateLimitResult = checkInquiryRateLimit(clientIp);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          "X-RateLimit-Limit": INQUIRY_RATE_LIMIT.maxRequests.toString(),
          "X-RateLimit-Remaining": "0"
        }
      }
    );
  }

  const payload = await request.json().catch(() => null);
  const parsed = inquirySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Request failed validation.",
        errors: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  try {
    const { record, snapshotPath } = await createInquiry(parsed.data);
    const notification = await notifyNewInquiry(record).catch((error) => ({
      status: "failed" as const,
      detail: error instanceof Error ? error.message : "Unexpected notification failure."
    }));

    return NextResponse.json(
      {
        success: true,
        storage: getStorageMode(),
        record,
        snapshotPath,
        notification,
        message: "Inquiry received. A strategist will reply within one business day."
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";

    return NextResponse.json(
      {
        success: false,
        message
      },
      { status: 503 }
    );
  }
}
