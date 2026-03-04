"use client";

import { useState } from "react";

export function OpsToolbar() {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  async function handleLogout() {
    setState("loading");

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/portal";
    } catch {
      setState("error");
    }
  }

  return (
    <div className="portal-toolbar">
      <span className="status-dot">Secure session active</span>
      <button className="secondary-link" type="button" onClick={() => void handleLogout()} disabled={state === "loading"}>
        {state === "loading" ? "Signing out..." : "Sign out"}
      </button>
      {state === "error" ? <span className="toolbar-error">Logout failed. Refresh and retry.</span> : null}
    </div>
  );
}
