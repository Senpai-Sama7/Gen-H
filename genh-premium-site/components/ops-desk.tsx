"use client";

import { useEffect, useMemo, useState } from "react";

import type { InquiryRecord, InquiryStatus } from "@/lib/types";

type Props = {
  initialRecords: InquiryRecord[];
  initialSnapshotPath: string | null;
};

type SaveState = {
  type: "idle" | "saving" | "success" | "error";
  message?: string;
};

type FilterState = "all" | InquiryStatus;
type DraftMap = Record<string, { status: InquiryStatus; notes: string }>;

const snapshotCacheKey = "genh-premium-site:last-snapshot";

export function OpsDesk({ initialRecords, initialSnapshotPath }: Props) {
  const [records, setRecords] = useState(initialRecords);
  const [snapshotPath, setSnapshotPath] = useState<string | null>(initialSnapshotPath);
  const [selectedId, setSelectedId] = useState<string | null>(initialRecords[0]?.id ?? null);
  const [filter, setFilter] = useState<FilterState>("all");
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<DraftMap>(() =>
    Object.fromEntries(initialRecords.map((record) => [record.id, { status: record.status, notes: record.notes }]))
  );
  const [saveState, setSaveState] = useState<SaveState>({ type: "idle" });
  const [refreshState, setRefreshState] = useState<SaveState>({ type: "idle" });

  useEffect(() => {
    if (!initialSnapshotPath) {
      return;
    }

    window.sessionStorage.setItem(snapshotCacheKey, initialSnapshotPath);
  }, [initialSnapshotPath]);

  const visibleRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return records.filter((record) => {
      const statusMatch = filter === "all" ? true : record.status === filter;
      const queryMatch =
        normalizedQuery.length === 0
          ? true
          : [record.company, record.name, record.email, record.projectType, record.goals].some((value) =>
              value.toLowerCase().includes(normalizedQuery)
            );

      return statusMatch && queryMatch;
    });
  }, [filter, query, records]);

  useEffect(() => {
    if (!selectedId || !visibleRecords.some((record) => record.id === selectedId)) {
      setSelectedId(visibleRecords[0]?.id ?? null);
    }
  }, [selectedId, visibleRecords]);

  const selectedRecord = useMemo(
    () => records.find((record) => record.id === selectedId) ?? visibleRecords[0] ?? null,
    [records, selectedId, visibleRecords]
  );

  const selectedDraft = selectedRecord ? drafts[selectedRecord.id] ?? { status: selectedRecord.status, notes: selectedRecord.notes } : null;

  const summary = useMemo(
    () => ({
      total: records.length,
      newCount: records.filter((record) => record.status === "new").length,
      qualified: records.filter((record) => record.status === "qualified").length,
      booked: records.filter((record) => record.status === "booked").length
    }),
    [records]
  );

  function syncRecords(nextRecords: InquiryRecord[], nextSnapshotPath?: string | null) {
    setRecords(nextRecords);
    setDrafts(Object.fromEntries(nextRecords.map((record) => [record.id, { status: record.status, notes: record.notes }])));
    setSelectedId((current) => (current && nextRecords.some((record) => record.id === current) ? current : nextRecords[0]?.id ?? null));

    if (nextSnapshotPath) {
      setSnapshotPath(nextSnapshotPath);
      window.sessionStorage.setItem(snapshotCacheKey, nextSnapshotPath);
    }
  }

  function updateDraft(patch: Partial<{ status: InquiryStatus; notes: string }>) {
    if (!selectedRecord) {
      return;
    }

    setDrafts((current) => ({
      ...current,
      [selectedRecord.id]: {
        ...current[selectedRecord.id],
        ...patch
      }
    }));
  }

  async function refreshQueue(mode: "cached" | "latest" = "cached") {
    setRefreshState({ type: "saving", message: "Refreshing queue..." });

    try {
      const endpoint = new URL("/api/inquiries", window.location.origin);
      const cachedSnapshot = window.sessionStorage.getItem(snapshotCacheKey);
      const targetSnapshot = mode === "cached" ? cachedSnapshot || snapshotPath : null;

      if (targetSnapshot) {
        endpoint.searchParams.set("snapshot", targetSnapshot);
      }

      const response = await fetch(endpoint.toString());
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.records) {
        throw new Error(payload?.message || "Failed to refresh records.");
      }

      syncRecords(payload.records, payload.snapshotPath ?? targetSnapshot);
      setRefreshState({ type: "success", message: mode === "latest" ? "Loaded latest snapshot." : "Queue synchronized." });
    } catch (error) {
      setRefreshState({
        type: "error",
        message: error instanceof Error ? error.message : "Unexpected refresh error."
      });
    }
  }

  async function saveSelectedRecord() {
    if (!selectedRecord || !selectedDraft) {
      return;
    }

    setSaveState({ type: "saving", message: "Saving changes..." });

    try {
      const endpoint = new URL(`/api/inquiries/${selectedRecord.id}`, window.location.origin);
      const cachedSnapshot = window.sessionStorage.getItem(snapshotCacheKey) || snapshotPath;

      if (cachedSnapshot) {
        endpoint.searchParams.set("snapshot", cachedSnapshot);
      }

      const response = await fetch(endpoint.toString(), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(selectedDraft)
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.record) {
        throw new Error(payload?.message || "Failed to update inquiry.");
      }

      const nextRecords = records.map((record) => (record.id === selectedRecord.id ? payload.record : record));
      syncRecords(nextRecords, payload.snapshotPath ?? cachedSnapshot);
      setSaveState({ type: "success", message: "Lead updated." });
    } catch (error) {
      setSaveState({
        type: "error",
        message: error instanceof Error ? error.message : "Unexpected save error."
      });
    }
  }

  if (records.length === 0) {
    return (
      <div className="workspace-empty">
        <strong>No inquiries captured yet.</strong>
        <span>Submit the public intake form first, then return here to manage the queue.</span>
        <button className="secondary-link" type="button" onClick={() => void refreshQueue("latest")}>
          Refresh queue
        </button>
      </div>
    );
  }

  return (
    <div className="desk-shell">
      <div className="desk-metrics">
        <article className="desk-metric-card">
          <span>All leads</span>
          <strong>{summary.total.toString().padStart(2, "0")}</strong>
        </article>
        <article className="desk-metric-card">
          <span>New</span>
          <strong>{summary.newCount.toString().padStart(2, "0")}</strong>
        </article>
        <article className="desk-metric-card">
          <span>Qualified</span>
          <strong>{summary.qualified.toString().padStart(2, "0")}</strong>
        </article>
        <article className="desk-metric-card">
          <span>Booked</span>
          <strong>{summary.booked.toString().padStart(2, "0")}</strong>
        </article>
      </div>

      <div className="desk-grid">
        <aside className="desk-sidebar">
          <div className="desk-controls">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search company, contact, or project" />
            <select value={filter} onChange={(event) => setFilter(event.target.value as FilterState)}>
              <option value="all">All statuses</option>
              <option value="new">New</option>
              <option value="qualified">Qualified</option>
              <option value="booked">Booked</option>
            </select>
          </div>

          <div className="desk-actions-row">
            <button className="secondary-link" type="button" onClick={() => void refreshQueue("cached")}>
              Refresh queue
            </button>
            <button className="secondary-link" type="button" onClick={() => void refreshQueue("latest")}>
              Load latest snapshot
            </button>
          </div>

          {refreshState.type !== "idle" ? <div className={`inline-alert ${refreshState.type === "error" ? "error" : "success"}`}>{refreshState.message}</div> : null}

          <div className="lead-list">
            {visibleRecords.map((record) => (
              <button
                key={record.id}
                type="button"
                className={`lead-list-item ${record.id === selectedRecord?.id ? "active" : ""}`}
                onClick={() => setSelectedId(record.id)}
              >
                <div>
                  <strong>{record.company}</strong>
                  <span>{record.name}</span>
                </div>
                <div>
                  <span className={`status-chip ${record.status}`}>{record.status}</span>
                  <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))}

            {visibleRecords.length === 0 ? (
              <div className="workspace-empty compact">
                <strong>No matching leads.</strong>
                <span>Change the filter or search terms.</span>
              </div>
            ) : null}
          </div>
        </aside>

        <section className="desk-detail">
          {selectedRecord && selectedDraft ? (
            <>
              <div className="detail-head">
                <div>
                  <span className="eyebrow">Selected lead</span>
                  <h3>{selectedRecord.company}</h3>
                  <p>{selectedRecord.projectType}</p>
                </div>
                <span className={`status-pill ${selectedDraft.status}`}>{selectedDraft.status}</span>
              </div>

              <div className="detail-grid">
                <div className="detail-block">
                  <span>Primary contact</span>
                  <strong>{selectedRecord.name}</strong>
                  <p>{selectedRecord.email}</p>
                  <p>{selectedRecord.phone}</p>
                </div>
                <div className="detail-block">
                  <span>Commercial context</span>
                  <strong>{selectedRecord.budgetBand}</strong>
                  <p>{selectedRecord.launchWindow}</p>
                  <p>Created {new Date(selectedRecord.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="detail-story">
                <span>Business goal</span>
                <p>{selectedRecord.goals}</p>
              </div>

              <div className="detail-editor">
                <label>
                  Lead status
                  <select value={selectedDraft.status} onChange={(event) => updateDraft({ status: event.target.value as InquiryStatus })}>
                    <option value="new">New</option>
                    <option value="qualified">Qualified</option>
                    <option value="booked">Booked</option>
                  </select>
                </label>

                <label>
                  Internal notes
                  <textarea
                    rows={8}
                    value={selectedDraft.notes}
                    onChange={(event) => updateDraft({ notes: event.target.value })}
                    placeholder="Record pricing posture, call outcomes, objections, scheduling notes, or next actions."
                  />
                </label>
              </div>

              <div className="desk-actions-row bottom">
                <button className="primary-button" type="button" onClick={() => void saveSelectedRecord()} disabled={saveState.type === "saving"}>
                  {saveState.type === "saving" ? "Saving..." : "Save lead updates"}
                </button>
                {saveState.type !== "idle" ? (
                  <div className={`inline-alert ${saveState.type === "error" ? "error" : "success"}`}>{saveState.message}</div>
                ) : null}
              </div>
            </>
          ) : (
            <div className="workspace-empty compact">
              <strong>Select a lead.</strong>
              <span>Choose an inquiry from the queue to review it.</span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
