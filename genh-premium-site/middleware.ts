import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_REALM = 'Basic realm="GEN-H Ops"';

function readEnv(name: string) {
  return process.env[name]?.trim() ?? "";
}

function unauthorized(message: string, status = 401) {
  return new NextResponse(message, {
    status,
    headers: {
      "WWW-Authenticate": AUTH_REALM,
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}

function isProtectedRequest(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/ops")) {
    return true;
  }

  if (pathname === "/api/inquiries") {
    return request.method === "GET";
  }

  return pathname.startsWith("/api/inquiries/");
}

export function middleware(request: NextRequest) {
  if (!isProtectedRequest(request)) {
    return NextResponse.next();
  }

  const username = readEnv("OPS_BASIC_USER");
  const password = readEnv("OPS_BASIC_PASS");

  if (!username || !password) {
    return unauthorized("OPS_BASIC_USER and OPS_BASIC_PASS must be configured before protected routes can be used.", 503);
  }

  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Basic ")) {
    return unauthorized("Authentication required.");
  }

  let decoded = "";

  try {
    decoded = atob(authorization.slice(6));
  } catch {
    return unauthorized("Malformed authorization header.");
  }

  const separatorIndex = decoded.indexOf(":");
  const incomingUser = separatorIndex >= 0 ? decoded.slice(0, separatorIndex) : "";
  const incomingPass = separatorIndex >= 0 ? decoded.slice(separatorIndex + 1) : "";

  if (incomingUser !== username || incomingPass !== password) {
    return unauthorized("Invalid credentials.");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/ops/:path*", "/api/inquiries/:path*"]
};
