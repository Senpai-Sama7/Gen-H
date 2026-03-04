import { OpsDesk } from "@/components/ops-desk";
import { getInquiryDashboard, listInquiriesWithSnapshot } from "@/lib/inquiries";

export const dynamic = "force-dynamic";

export default async function OpsPage() {
  const dashboard = await getInquiryDashboard();
  const inquiryList = await listInquiriesWithSnapshot(50);
  const records = inquiryList.records;

  return (
    <main className="site-shell" style={{ minHeight: "100vh", paddingBottom: 64 }}>
      <section className="hero section-frame" style={{ gridTemplateColumns: "0.9fr 1.1fr" }}>
        <div className="hero-copy">
          <span className="eyebrow">Protected operator desk</span>
          <h1 style={{ maxWidth: "7ch" }}>Review inbound demand without leaving the app.</h1>
          <p className="lead-copy">
            This route is Basic Auth protected. It is intended for owners, office managers, and sales operators who need a quick
            read on active demand, update dispositions, and leave next-step notes without exposing inquiry records publicly.
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
            can inspect, qualify, book, and annotate records here.
          </p>
        </div>

        <OpsDesk initialRecords={records} initialSnapshotPath={inquiryList.snapshotPath} />
      </section>
    </main>
  );
}
