"use client";

import { FormEvent, useMemo, useState } from "react";

function readNextPath() {
  if (typeof window === "undefined") {
    return "/portal/dashboard";
  }

  const params = new URLSearchParams(window.location.search);
  const next = params.get("next");

  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/portal/dashboard";
  }

  return next;
}

export function PortalLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<{ type: "idle" | "loading" | "error"; message?: string }>({ type: "idle" });

  const nextPath = useMemo(() => readNextPath(), []);
  const canSubmit = username.trim().length > 0 && password.length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setState({ type: "loading", message: "Unlocking portal..." });

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password, next: nextPath })
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || "Portal access failed.");
      }

      window.location.href = payload.nextPath || nextPath;
    } catch (error) {
      setState({
        type: "error",
        message: error instanceof Error ? error.message : "Unexpected login error."
      });
    }
  }

  return (
    <form className="portal-form" onSubmit={handleSubmit}>
      <label>
        Operator username
        <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="ops" autoComplete="username" />
      </label>

      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your operator password"
          autoComplete="current-password"
        />
      </label>

      <button className="primary-button" type="submit" disabled={!canSubmit || state.type === "loading"}>
        {state.type === "loading" ? "Opening portal..." : "Enter admin portal"}
      </button>

      <p className="micro-copy">Only authenticated operators can view pipeline data, update lead statuses, and add internal notes.</p>

      {state.type === "error" ? <div className="inline-alert error">{state.message}</div> : null}
    </form>
  );
}
