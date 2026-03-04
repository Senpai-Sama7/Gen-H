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
  projectType: "Signature build",
  budgetBand: "$12k - $25k",
  launchWindow: "Within 30 days",
  goals: ""
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submission, setSubmission] = useState<SubmissionState>({ status: "idle" });

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length >= 2 &&
      form.company.trim().length >= 2 &&
      form.email.includes("@") &&
      form.goals.trim().length >= 20
    );
  }, [form]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmission({ status: "loading" });

    try {
      const endpoint = new URL("/api/inquiries", window.location.origin).toString();
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Submission failed.");
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
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-grid two-up">
        <label>
          Strategic contact
          <input value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Name" />
        </label>
        <label>
          Company
          <input value={form.company} onChange={(event) => updateField("company", event.target.value)} placeholder="Company" />
        </label>
      </div>

      <div className="form-grid two-up">
        <label>
          Email
          <input value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="team@company.com" />
        </label>
        <label>
          Phone
          <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="(555) 014-8891" />
        </label>
      </div>

      <div className="form-grid three-up">
        <label>
          Build type
          <select value={form.projectType} onChange={(event) => updateField("projectType", event.target.value)}>
            <option>Signature build</option>
            <option>Growth refresh</option>
            <option>Lead funnel rebuild</option>
            <option>Multi-location rollout</option>
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
        Commercial objective
        <textarea
          value={form.goals}
          onChange={(event) => updateField("goals", event.target.value)}
          placeholder="Describe what needs to change: no-show rates, weak conversion, franchise scale-up, premium positioning, membership sales, dispatch overflow, or lead routing."
          rows={5}
        />
      </label>

      <div className="form-actions">
        <button className="primary-button" type="submit" disabled={!canSubmit || submission.status === "loading"}>
          {submission.status === "loading" ? "Submitting strategic brief..." : "Book a strategy session"}
        </button>
        <p className="form-footnote">Deployed on Vercel. Inquiries persist to Vercel Blob in production, or to local storage during development.</p>
      </div>

      {submission.status !== "idle" ? (
        <div className={`submission-banner ${submission.status}`}>
          <strong>{submission.status === "success" ? "Inquiry confirmed" : "Submission blocked"}</strong>
          <span>{submission.message}</span>
          {submission.detail ? <span>{submission.detail}</span> : null}
          {submission.record ? <span>Reference #{submission.record.id.slice(0, 8).toUpperCase()}</span> : null}
        </div>
      ) : null}
    </form>
  );
}
