import { NextResponse } from "next/server";

import { getStorageMode } from "@/lib/inquiries";

export const dynamic = "force-dynamic";

function buildChecks() {
  const storage = getStorageMode();
  const hasKv = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
  const hasOps = Boolean(process.env.OPS_BASIC_USER && process.env.OPS_BASIC_PASS);
  const hasAlerts = Boolean(process.env.RESEND_API_KEY && process.env.ALERT_EMAIL);
  const hasSiteUrl = Boolean(process.env.NEXT_PUBLIC_SITE_URL);

  return {
    storage,
    checks: {
      storage: {
        ok: storage === "vercel-kv" || storage === "local-dev",
        detail:
          storage === "vercel-kv"
            ? "Persistent Vercel KV storage is configured."
            : storage === "local-dev"
              ? "Local JSON storage is active. Set Vercel KV before production deployment."
              : "Vercel environment detected without KV storage."
      },
      kv: {
        ok: hasKv,
        detail: hasKv ? "KV credentials are present." : "KV_REST_API_URL and KV_REST_API_TOKEN are missing."
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
    deployReady: hasKv && hasOps && hasSiteUrl,
    launchReady: hasKv && hasOps && hasAlerts && hasSiteUrl
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
