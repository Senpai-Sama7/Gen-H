import { NextResponse } from "next/server";

import { getStorageMode } from "@/lib/inquiries";

export const dynamic = "force-dynamic";

function hasValue(name: string) {
  return Boolean(process.env[name]?.trim());
}

function buildChecks() {
  const storage = getStorageMode();
  const hasBlob = hasValue("BLOB_READ_WRITE_TOKEN");
  const hasOps = hasValue("OPS_BASIC_USER") && hasValue("OPS_BASIC_PASS");
  const hasAlerts = hasValue("RESEND_API_KEY") && hasValue("ALERT_EMAIL");
  const hasSiteUrl = hasValue("NEXT_PUBLIC_SITE_URL");

  return {
    storage,
    checks: {
      storage: {
        ok: storage === "vercel-blob" || storage === "local-dev",
        detail:
          storage === "vercel-blob"
            ? "Persistent Vercel Blob storage is configured."
            : storage === "local-dev"
              ? "Local JSON storage is active. Set Vercel Blob before production deployment."
              : "Vercel environment detected without Blob storage."
      },
      blob: {
        ok: hasBlob,
        detail: hasBlob ? "Blob credentials are present." : "BLOB_READ_WRITE_TOKEN is missing."
      },
      blobPath: {
        ok: hasValue("INQUIRY_BLOB_PATH") || storage !== "vercel-blob",
        detail:
          storage !== "vercel-blob"
            ? "Blob path is only used for Vercel Blob storage."
            : hasValue("INQUIRY_BLOB_PATH")
              ? "A dedicated blob pathname is configured."
              : "INQUIRY_BLOB_PATH is missing. A default public pathname will be used."
      },
      opsAuth: {
        ok: hasOps,
        detail: hasOps ? "Operator desk protection is configured." : "OPS_BASIC_USER and OPS_BASIC_PASS are missing."
      },
      alerts: {
        ok: hasAlerts,
        detail: hasAlerts ? "Resend notifications are configured." : "RESEND_API_KEY and ALERT_EMAIL are missing."
      },
      siteUrl: {
        ok: hasSiteUrl,
        detail: hasSiteUrl ? "NEXT_PUBLIC_SITE_URL is configured." : "NEXT_PUBLIC_SITE_URL is missing."
      }
    },
    deployReady: hasBlob && hasOps && hasSiteUrl,
    launchReady: hasBlob && hasOps && hasSiteUrl
  };
}

export async function GET() {
  const payload = buildChecks();

  return NextResponse.json({
    success: true,
    ...payload,
    timestamp: new Date().toISOString()
  });
}
