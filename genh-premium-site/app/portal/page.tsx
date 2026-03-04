import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { PortalLogin } from "@/components/portal-login";
import { SESSION_COOKIE, isSessionTokenValid } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const cookieStore = await cookies();
  const isAuthenticated = await isSessionTokenValid(cookieStore.get(SESSION_COOKIE)?.value);

  if (isAuthenticated) {
    redirect("/portal/dashboard");
  }

  return (
    <main className="site-shell portal-shell">
      <section className="portal-layout">
        <div className="portal-story glass-panel">
          <span className="eyebrow">Operator portal</span>
          <h1>Run the sales floor without touching raw infrastructure.</h1>
          <p>
            This portal gives you a private control surface for every inbound opportunity: live lead review, qualification,
            booking, internal notes, and an immediate picture of what is moving through the pipeline.
          </p>
          <div className="portal-points">
            <div>
              <strong>Live queue</strong>
              <span>Review every new inquiry in one place.</span>
            </div>
            <div>
              <strong>Decision controls</strong>
              <span>Mark leads as new, qualified, or booked with internal notes.</span>
            </div>
            <div>
              <strong>Clear handoff</strong>
              <span>Keep operators, sales staff, and ownership aligned behind one dashboard.</span>
            </div>
          </div>
        </div>

        <div className="portal-card glass-panel">
          <div className="portal-card-head">
            <span className="eyebrow">Secure access</span>
            <h2>Sign in to the admin dashboard</h2>
            <p>Use the operator credentials configured for this deployment.</p>
          </div>
          <PortalLogin />
        </div>
      </section>
    </main>
  );
}
