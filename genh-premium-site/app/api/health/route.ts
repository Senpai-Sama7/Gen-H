import { NextResponse } from "next/server";

import { getStorageMode } from "@/lib/inquiries";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    service: "genh-premium-site",
    storage: getStorageMode(),
    timestamp: new Date().toISOString()
  });
}
