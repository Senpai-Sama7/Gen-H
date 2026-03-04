import { NextResponse } from "next/server";

import { getClearedSessionCookieConfig } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Portal session closed."
  });

  response.cookies.set(getClearedSessionCookieConfig());
  return response;
}
