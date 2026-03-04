export const SESSION_COOKIE = "genh_ops_session";
const SESSION_MAX_AGE = 60 * 60 * 12;

function readEnv(name: string) {
  return process.env[name]?.trim() ?? "";
}

export function getPortalUsername() {
  return readEnv("OPS_BASIC_USER");
}

export function getPortalPassword() {
  return readEnv("OPS_BASIC_PASS");
}

export function hasPortalCredentials() {
  return Boolean(getPortalUsername() && getPortalPassword());
}

function getSessionSecret() {
  return readEnv("OPS_SESSION_SECRET") || `${getPortalUsername()}:${getPortalPassword()}:genh-portal`;
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

export async function createSessionToken() {
  const payload = new TextEncoder().encode(`${getPortalUsername()}::${getPortalPassword()}::${getSessionSecret()}`);
  const digest = await crypto.subtle.digest("SHA-256", payload);
  return bytesToHex(new Uint8Array(digest));
}

export async function isSessionTokenValid(value: string | null | undefined) {
  if (!value || !hasPortalCredentials()) {
    return false;
  }

  return value === (await createSessionToken());
}

export function getSessionCookieConfig(value: string) {
  return {
    name: SESSION_COOKIE,
    value,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE
  };
}

export function getClearedSessionCookieConfig() {
  return {
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  };
}

export function normalizeNextPath(value?: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/portal/dashboard";
  }

  return value;
}
