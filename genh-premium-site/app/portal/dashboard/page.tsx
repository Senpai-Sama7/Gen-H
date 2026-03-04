import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { OpsDesk } from "@/components/ops-desk";
import { OpsToolbar } from "@/components/ops-toolbar";
import { SESSION_COOKIE, isSessionTokenValid } from "@/lib/auth";
import { getInquiryDashboard, listInquiriesWithSnapshot } from "@/lib/inquiries";

export const dynamic = "force-dynamic";

export default async function PortalDashboardPage() {
  const cookieStore = await cookies();
  const isAuthenticated = await isSessionTokenValid(cookieStore.get(SESSION_COOKIE)?.value);

  if (!isAuthenticated) {
    redirect("/portal");
  }

  const dashboard = await getInquiryDashboard();
  const inquiryList = await listInquiriesWithSnapshot(100);
  const records = inquiryList.records;
  const newCount = records.filter((record) => record.status === "new").length;
  const qualifiedCount = records.filter((record) => record.status === "qualified").length;
  const bookedCount = records.filter((record) => record.status === "booked").length;

  return (
    <main className="site-shell admin-shell">
      <header className="admin-top glass-panel">
        <div>
          <span className="eyebrow">GEN-H command center</span>
          <h1>Admin dashboard</h1>
          <p>Everything needed to process demand, qualify leads, and keep the pipeline clean.</p>
        </div>
        <OpsToolbar />
      </header>

      <section className="admin-summary-grid">
        <article className="summary-card glass-panel">
          <span>Tracked inquiries</span>
          <strong>{dashboard.totalTracked.toString().padStart(2, "0")}</strong>
          <p>Total leads currently visible in the active register.</p>
        </article>
        <article className="summary-card glass-panel">
          <span>New</span>
          <strong>{newCount.toString().padStart(2, "0")}</strong>
          <p>Needs first review or outbound follow-up.</p>
        </article>
        <article className="summary-card glass-panel">
          <span>Qualified</span>
          <strong>{qualifiedCount.toString().padStart(2, "0")}</strong>
          <p>Commercially relevant and worth advancing now.</p>
        </article>
        <article className="summary-card glass-panel">
          <span>Booked</span>
          <strong>{bookedCount.toString().padStart(2, "0")}</strong>
          <p>Committed opportunities with a next step attached.</p>
        </article>
      </section>

      <section className="admin-layout">
        <aside className="admin-sidebar glass-panel">
          <div>
            <span className="eyebrow">Control surfaces</span>
            <h2>What you can manage here</h2>
            <p>The dashboard keeps the workflow obvious: review the queue, open a lead, set status, save notes, and move on.</p>
          </div>
          <div className="admin-checklist">
            <div>
              <strong>1. Review</strong>
              <span>Search and filter leads from the queue.</span>
            </div>
            <div>
              <strong>2. Decide</strong>
              <span>Mark each lead as new, qualified, or booked.</span>
            </div>
            <div>
              <strong>3. Record</strong>
              <span>Capture notes so follow-up is consistent.</span>
            </div>
          </div>
          <div className="admin-links">
            <a className="secondary-link" href="/api/health">
              Runtime health
            </a>
            <a className="secondary-link" href="/api/readiness">
              Deployment readiness
            </a>
          </div>
        </aside>

        <section className="admin-workspace glass-panel">
          <div className="workspace-head">
            <div>
              <span className="eyebrow">Live lead workspace</span>
              <h2>Open any lead and update it without leaving the portal.</h2>
            </div>
            <span className={`status-pill ${dashboard.storage}`}>{dashboard.storage.replace("-", " ")}</span>
          </div>
          <OpsDesk initialRecords={records} initialSnapshotPath={inquiryList.snapshotPath} />
        </section>
      </section>
    </main>
  );
}
