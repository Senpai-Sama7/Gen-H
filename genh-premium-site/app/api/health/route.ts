import { NextResponse } from "next/server";

import { getStorageMode } from "@/lib/inquiries";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const hasOps = Boolean(process.env.OPS_BASIC_USER && process.env.OPS_BASIC_PASS);
  const hasAlerts = Boolean(process.env.RESEND_API_KEY && process.env.ALERT_EMAIL);
  const hasSiteUrl = Boolean(process.env.NEXT_PUBLIC_SITE_URL);

  return NextResponse.json({
    success: true,
    service: "genh-premium-site",
    storage: getStorageMode(),
    notifications: hasAlerts,
    opsProtection: hasOps,
    deployReady: hasBlob && hasOps && hasSiteUrl,
    launchReady: hasBlob && hasOps && hasSiteUrl,
    timestamp: new Date().toISOString()
  });
}
