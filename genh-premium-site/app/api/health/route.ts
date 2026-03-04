import { NextResponse } from "next/server";

import { getStorageMode } from "@/lib/inquiries";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    service: "genh-premium-site",
    storage: getStorageMode(),
    notifications: Boolean(process.env.RESEND_API_KEY && process.env.ALERT_EMAIL),
    opsProtection: Boolean(process.env.OPS_BASIC_USER && process.env.OPS_BASIC_PASS),
    timestamp: new Date().toISOString()
  });
}
