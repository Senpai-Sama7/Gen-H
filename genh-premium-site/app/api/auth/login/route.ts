import { NextResponse } from "next/server";
import { z } from "zod";

import {
  createSessionToken,
  getPortalPassword,
  getPortalUsername,
  getSessionCookieConfig,
  hasPortalCredentials,
  normalizeNextPath
} from "@/lib/auth";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
  next: z.string().optional()
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Username and password are required."
      },
      { status: 400 }
    );
  }

  if (!hasPortalCredentials()) {
    return NextResponse.json(
      {
        success: false,
        message: "Portal access is not configured yet. Set OPS_BASIC_USER and OPS_BASIC_PASS."
      },
      { status: 503 }
    );
  }

  if (parsed.data.username !== getPortalUsername() || parsed.data.password !== getPortalPassword()) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid operator credentials."
      },
      { status: 401 }
    );
  }

  const token = await createSessionToken();
  const response = NextResponse.json({
    success: true,
    message: "Portal unlocked.",
    nextPath: normalizeNextPath(parsed.data.next)
  });

  response.cookies.set(getSessionCookieConfig(token));
  return response;
}
