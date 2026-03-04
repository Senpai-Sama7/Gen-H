import type { CSSProperties } from "react";

import { getInquiryDashboard, listInquiries } from "@/lib/inquiries";

export const dynamic = "force-dynamic";

export default async function OpsPage() {
  const dashboard = await getInquiryDashboard();
  const records = await listInquiries(50);

  return (
    <main className="site-shell" style={{ minHeight: "100vh", paddingBottom: 64 }}>
      <section className="hero section-frame" style={{ gridTemplateColumns: "0.9fr 1.1fr" }}>
        <div className="hero-copy">
          <span className="eyebrow">Protected operator desk</span>
          <h1 style={{ maxWidth: "7ch" }}>Review inbound demand without leaving the app.</h1>
          <p className="lead-copy">
            This route is Basic Auth protected. It is intended for owners, office managers, and sales operators who need a quick
            read on active demand without exposing inquiry records publicly.
          </p>
          <div className="hero-actions">
            <a className="secondary-link" href="/api/inquiries">
              Export inquiry JSON
            </a>
            <a className="secondary-link" href="/api/health">
              Runtime health
            </a>
          </div>
        </div>

        <div className="hero-panel">
          <div className="panel-header">
            <span className="eyebrow">Operational summary</span>
            <span className={`status-pill ${dashboard.storage}`}>{dashboard.storage.replace("-", " ")}</span>
          </div>
          <div className="dashboard-grid">
            <div className="metric-card feature-large">
              <span>Total tracked</span>
              <strong>{dashboard.totalTracked.toString().padStart(2, "0")}</strong>
              <p>Recent inquiries mirrored from the same storage backend used by the public intake form.</p>
            </div>
            <div className="metric-card">
              <span>This week</span>
              <strong>{dashboard.thisWeek.toString().padStart(2, "0")}</strong>
            </div>
            <div className="metric-card">
              <span>Visible in desk</span>
              <strong>{records.length.toString().padStart(2, "0")}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="blueprint section-frame" style={{ marginTop: 20 }}>
        <div className="section-copy compact">
          <span className="eyebrow">Lead register</span>
          <h2 style={{ maxWidth: "10ch" }}>Every inquiry captured by the live intake endpoint.</h2>
          <p style={{ marginTop: 16 }}>
            The operator desk reads directly from the backend. Public visitors can submit inquiries, but only authenticated users
            can inspect this table and the raw JSON export.
          </p>
        </div>

        {records.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 18 }}>
            <strong>No inquiries captured yet.</strong>
            <span>Submit the public intake form first, then return here.</span>
          </div>
        ) : (
          <div style={{ overflowX: "auto", marginTop: 20 }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                minWidth: 920,
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 22,
                overflow: "hidden",
                background: "linear-gradient(180deg, rgba(28, 28, 42, 0.66), rgba(14, 14, 22, 0.74))"
              }}
            >
              <thead>
                <tr>
                  {[
                    "Company",
                    "Contact",
                    "Type",
                    "Budget",
                    "Launch",
                    "Status",
                    "Captured",
                    "Goal"
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        textAlign: "left",
                        padding: "14px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                        fontSize: "0.82rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "#d8a85f",
                        background: "rgba(255,255,255,0.02)"
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td style={cellStyle}>
                      <strong style={{ display: "block", color: "#f6f0e4" }}>{record.company}</strong>
                      <span style={mutedText}>{record.email}</span>
                    </td>
                    <td style={cellStyle}>
                      <strong style={{ display: "block", color: "#f6f0e4" }}>{record.name}</strong>
                      <span style={mutedText}>{record.phone}</span>
                    </td>
                    <td style={cellStyle}>{record.projectType}</td>
                    <td style={cellStyle}>{record.budgetBand}</td>
                    <td style={cellStyle}>{record.launchWindow}</td>
                    <td style={cellStyle}>
                      <span
                        style={{
                          display: "inline-flex",
                          padding: "6px 10px",
                          borderRadius: 999,
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "#8cd9af",
                          background: "rgba(140, 217, 175, 0.08)",
                          textTransform: "capitalize"
                        }}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td style={cellStyle}>{new Date(record.createdAt).toLocaleString()}</td>
                    <td style={{ ...cellStyle, minWidth: 280 }}>{record.goals}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

const cellStyle: CSSProperties = {
  padding: "16px",
  borderBottom: "1px solid rgba(255,255,255,0.05)",
  verticalAlign: "top",
  color: "#f6f0e4",
  fontSize: "0.95rem",
  lineHeight: 1.55
};

const mutedText: CSSProperties = {
  color: "#b8ad98",
  fontSize: "0.84rem"
};
