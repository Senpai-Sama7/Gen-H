import { NextResponse } from "next/server";

import { getStorageMode } from "@/lib/inquiries";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasKv = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
  const hasOps = Boolean(process.env.OPS_BASIC_USER && process.env.OPS_BASIC_PASS);
  const hasAlerts = Boolean(process.env.RESEND_API_KEY && process.env.ALERT_EMAIL);
  const hasSiteUrl = Boolean(process.env.NEXT_PUBLIC_SITE_URL);

  return NextResponse.json({
    success: true,
    service: "genh-premium-site",
    storage: getStorageMode(),
    notifications: hasAlerts,
    opsProtection: hasOps,
    deployReady: hasKv && hasOps && hasSiteUrl,
    launchReady: hasKv && hasOps && hasAlerts && hasSiteUrl,
    timestamp: new Date().toISOString()
  });
}
