import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE, hasPortalCredentials, isSessionTokenValid } from "@/lib/auth";

function isProtectedRequest(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/portal/dashboard") || pathname.startsWith("/ops")) {
    return true;
  }

  if (pathname === "/api/inquiries") {
    return request.method === "GET";
  }

  return pathname.startsWith("/api/inquiries/");
}

function unauthorizedApi(message: string, status = 401) {
  return NextResponse.json(
    {
      success: false,
      message
    },
    { status }
  );
}

function redirectToPortal(request: NextRequest, reason?: string) {
  const next = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const url = new URL("/portal", request.url);
  url.searchParams.set("next", next);
  if (reason) {
    url.searchParams.set("reason", reason);
  }
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  if (!isProtectedRequest(request)) {
    return NextResponse.next();
  }

  const isApiRequest = request.nextUrl.pathname.startsWith("/api/");

  if (!hasPortalCredentials()) {
    if (isApiRequest) {
      return unauthorizedApi("Portal access is not configured. Set OPS_BASIC_USER and OPS_BASIC_PASS.", 503);
    }

    return redirectToPortal(request, "unconfigured");
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  const isAuthenticated = await isSessionTokenValid(sessionToken);

  if (isAuthenticated) {
    return NextResponse.next();
  }

  if (isApiRequest) {
    return unauthorizedApi("Portal session required.");
  }

  return redirectToPortal(request, "signin");
}

export const config = {
  matcher: ["/portal/dashboard/:path*", "/ops/:path*", "/api/inquiries/:path*"]
};
