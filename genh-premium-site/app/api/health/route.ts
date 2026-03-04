import { NextResponse } from "next/server";

import { getStorageMode } from "@/lib/inquiries";

export const dynamic = "force-dynamic";

function hasValue(name: string) {
  return Boolean(process.env[name]?.trim());
}

export async function GET() {
  const hasBlob = hasValue("BLOB_READ_WRITE_TOKEN");
  const hasOps = hasValue("OPS_BASIC_USER") && hasValue("OPS_BASIC_PASS");
  const hasAlerts = hasValue("RESEND_API_KEY") && hasValue("ALERT_EMAIL");
  const hasSiteUrl = hasValue("NEXT_PUBLIC_SITE_URL");

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
