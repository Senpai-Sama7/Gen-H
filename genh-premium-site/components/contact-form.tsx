"use client";

import { FormEvent, useMemo, useState } from "react";

import type { InquiryRecord } from "@/lib/types";

type FormState = {
  name: string;
  company: string;
  email: string;
  phone: string;
  projectType: string;
  budgetBand: string;
  launchWindow: string;
  goals: string;
};

type SubmissionState = {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
  record?: InquiryRecord;
  detail?: string;
};

const initialState: FormState = {
  name: "",
  company: "",
  email: "",
  phone: "",
  projectType: "Revenue acceleration site",
  budgetBand: "$25k - $50k",
  launchWindow: "Within 30 days",
  goals: ""
};

const snapshotCacheKey = "genh-premium-site:last-snapshot";

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submission, setSubmission] = useState<SubmissionState>({ status: "idle" });

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length >= 2 &&
      form.company.trim().length >= 2 &&
      form.email.includes("@") &&
      form.phone.trim().length >= 7 &&
      form.goals.trim().length >= 24
    );
  }, [form]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmission({ status: "loading" });

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.record) {
        throw new Error(payload?.message || "Submission failed.");
      }

      if (payload.snapshotPath && typeof window !== "undefined") {
        window.sessionStorage.setItem(snapshotCacheKey, payload.snapshotPath);
      }

      setSubmission({
        status: "success",
        message: payload.message,
        record: payload.record,
        detail: payload.notification?.detail
      });
      setForm(initialState);
    } catch (error) {
      setSubmission({
        status: "error",
        message: error instanceof Error ? error.message : "Unexpected submission error."
      });
    }
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form className="intake-form" onSubmit={handleSubmit}>
      <div className="intake-grid split-two">
        <label>
          Name
          <input value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Full name" />
        </label>
        <label>
          Company
          <input value={form.company} onChange={(event) => updateField("company", event.target.value)} placeholder="Company name" />
        </label>
      </div>

      <div className="intake-grid split-two">
        <label>
          Email
          <input value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="team@company.com" />
        </label>
        <label>
          Phone
          <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="(555) 014-8891" />
        </label>
      </div>

      <div className="intake-grid split-three">
        <label>
          Project type
          <select value={form.projectType} onChange={(event) => updateField("projectType", event.target.value)}>
            <option>Revenue acceleration site</option>
            <option>Offer repositioning</option>
            <option>Operator dashboard rollout</option>
            <option>Multi-location relaunch</option>
          </select>
        </label>
        <label>
          Budget
          <select value={form.budgetBand} onChange={(event) => updateField("budgetBand", event.target.value)}>
            <option>$12k - $25k</option>
            <option>$25k - $50k</option>
            <option>$50k - $100k</option>
            <option>$100k+</option>
          </select>
        </label>
        <label>
          Launch window
          <select value={form.launchWindow} onChange={(event) => updateField("launchWindow", event.target.value)}>
            <option>Within 30 days</option>
            <option>Within this quarter</option>
            <option>Within 6 months</option>
            <option>Exploring options</option>
          </select>
        </label>
      </div>

      <label>
        What needs to improve?
        <textarea
          value={form.goals}
          onChange={(event) => updateField("goals", event.target.value)}
          rows={5}
          placeholder="Explain the current bottleneck: weak lead quality, poor presentation, low-margin jobs, slow follow-up, dispatch friction, or lack of visibility."
        />
      </label>

      <div className="form-surface-footer">
        <button className="primary-button" type="submit" disabled={!canSubmit || submission.status === "loading"}>
          {submission.status === "loading" ? "Submitting brief..." : "Submit strategy brief"}
        </button>
        <p className="micro-copy">The same backend stores the lead instantly and makes it available inside the admin portal.</p>
      </div>

      {submission.status !== "idle" ? (
        <div className={`inline-alert ${submission.status === "success" ? "success" : "error"}`}>
          <strong>{submission.status === "success" ? "Inquiry captured." : "Submission blocked."}</strong>
          <span>{submission.message}</span>
          {submission.detail ? <span>{submission.detail}</span> : null}
          {submission.record ? <span>Reference #{submission.record.id.slice(0, 8).toUpperCase()}</span> : null}
        </div>
      ) : null}
    </form>
  );
}
