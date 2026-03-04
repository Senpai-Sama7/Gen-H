"use client";

import { useMemo, useState } from "react";

import type { InquiryRecord, InquiryStatus } from "@/lib/types";

type Props = {
  initialRecords: InquiryRecord[];
};

type SaveState = {
  type: "idle" | "saving" | "success" | "error";
  message?: string;
};

type DraftMap = Record<string, { status: InquiryStatus; notes: string }>;

type SaveMap = Record<string, SaveState>;

export function OpsDesk({ initialRecords }: Props) {
  const [records, setRecords] = useState(initialRecords);
  const [drafts, setDrafts] = useState<DraftMap>(() =>
    Object.fromEntries(initialRecords.map((record) => [record.id, { status: record.status, notes: record.notes }]))
  );
  const [saveState, setSaveState] = useState<SaveMap>({});

  const summary = useMemo(() => {
    return {
      total: records.length,
      qualified: records.filter((record) => record.status === "qualified").length,
      booked: records.filter((record) => record.status === "booked").length
    };
  }, [records]);

  function updateDraft(id: string, patch: Partial<{ status: InquiryStatus; notes: string }>) {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        ...patch
      }
    }));
  }

  async function saveRecord(id: string) {
    const draft = drafts[id];

    if (!draft) {
      return;
    }

    setSaveState((current) => ({
      ...current,
      [id]: { type: "saving", message: "Saving changes..." }
    }));

    try {
      const endpoint = new URL(`/api/inquiries/${id}`, window.location.origin).toString();
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(draft)
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.record) {
        throw new Error(payload?.message || "Failed to update inquiry.");
      }

      setRecords((current) => current.map((record) => (record.id === id ? payload.record : record)));
      setDrafts((current) => ({
        ...current,
        [id]: {
          status: payload.record.status,
          notes: payload.record.notes
        }
      }));
      setSaveState((current) => ({
        ...current,
        [id]: { type: "success", message: "Saved." }
      }));
    } catch (error) {
      setSaveState((current) => ({
        ...current,
        [id]: {
          type: "error",
          message: error instanceof Error ? error.message : "Unexpected save error."
        }
      }));
    }
  }

  if (records.length === 0) {
    return (
      <div className="empty-state" style={{ marginTop: 18 }}>
        <strong>No inquiries captured yet.</strong>
        <span>Submit the public intake form first, then return here.</span>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 18, marginTop: 20 }}>
      <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        <div className="metric-card">
          <span>Visible pipeline</span>
          <strong>{summary.total.toString().padStart(2, "0")}</strong>
        </div>
        <div className="metric-card">
          <span>Qualified</span>
          <strong>{summary.qualified.toString().padStart(2, "0")}</strong>
        </div>
        <div className="metric-card">
          <span>Booked</span>
          <strong>{summary.booked.toString().padStart(2, "0")}</strong>
        </div>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {records.map((record) => {
          const draft = drafts[record.id] ?? { status: record.status, notes: record.notes };
          const state = saveState[record.id] ?? { type: "idle" as const };

          return (
            <article key={record.id} className="service-card" style={{ gridTemplateColumns: "1.25fr 0.9fr", gap: 20 }}>
              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <span className="eyebrow">{record.projectType}</span>
                  <h3 style={{ marginBottom: 10 }}>{record.company}</h3>
                  <p style={{ margin: 0, color: "#f6f0e4" }}>{record.goals}</p>
                </div>
                <div style={{ display: "grid", gap: 6, color: "#b8ad98", fontSize: "0.92rem" }}>
                  <span>
                    {record.name} · {record.email}
                  </span>
                  <span>
                    {record.phone} · {record.budgetBand} · {record.launchWindow}
                  </span>
                  <span>Captured {new Date(record.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                <label>
                  Pipeline status
                  <select value={draft.status} onChange={(event) => updateDraft(record.id, { status: event.target.value as InquiryStatus })}>
                    <option value="new">New</option>
                    <option value="qualified">Qualified</option>
                    <option value="booked">Booked</option>
                  </select>
                </label>

                <label>
                  Operator notes
                  <textarea
                    rows={4}
                    value={draft.notes}
                    onChange={(event) => updateDraft(record.id, { notes: event.target.value })}
                    placeholder="Add call notes, scheduling context, pricing posture, or next actions."
                  />
                </label>

                <div className="form-actions" style={{ justifyContent: "space-between" }}>
                  <button className="primary-button" type="button" onClick={() => void saveRecord(record.id)} disabled={state.type === "saving"}>
                    {state.type === "saving" ? "Saving..." : "Save record"}
                  </button>
                  {state.type !== "idle" ? (
                    <span
                      style={{
                        color: state.type === "error" ? "#f2a3a3" : state.type === "success" ? "#8cd9af" : "#b8ad98",
                        fontSize: "0.84rem"
                      }}
                    >
                      {state.message}
                    </span>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
