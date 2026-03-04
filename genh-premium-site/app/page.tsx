import { ContactForm } from "@/components/contact-form";
import { getInquiryDashboard } from "@/lib/inquiries";

export const dynamic = "force-dynamic";

const operatingSignals = [
  {
    label: "Signature builds",
    value: "14 day",
    detail: "Average launch cycle for premium HVAC operators migrating off fragmented marketing stacks."
  },
  {
    label: "Lead routing latency",
    value: "< 45 sec",
    detail: "Inbound calls, form submissions, and campaign alerts are routed into a single revenue workflow."
  },
  {
    label: "Revenue-grade pages",
    value: "18 modules",
    detail: "Conversion sections, proof surfaces, financing prompts, and dispatch-aware CTAs."
  }
];

const signatureServices = [
  {
    title: "Revenue architecture",
    body: "Custom lead flows, dispatch-aware page logic, financing prompts, and trust systems shaped for premium HVAC operators."
  },
  {
    title: "Offer engineering",
    body: "Tune maintenance memberships, emergency service offers, install promos, and seasonal demand surges without diluting margin."
  },
  {
    title: "Executive reporting",
    body: "Operators see campaign velocity, qualified demand, and close-ready conversations without touching code."
  }
];

const deliverySequence = [
  "Strategic revenue audit and market diagnosis",
  "Messaging and offer stack for residential or commercial lanes",
  "Full TSX build with server routes, analytics hooks, and conversion QA",
  "Vercel deployment, launch oversight, and post-launch iteration"
];

export default async function HomePage() {
  const dashboard = await getInquiryDashboard();
  const phone = process.env.COMPANY_PHONE || "(555) 014-8891";
  const email = process.env.COMPANY_EMAIL || "advisors@genh.studio";

  return (
    <main className="site-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <header className="top-bar section-frame">
        <div>
          <span className="eyebrow">GEN-H STUDIO</span>
          <span className="top-copy">Premium revenue systems for elite HVAC brands</span>
        </div>
        <div className="top-links">
          <a href={`tel:${phone}`}>{phone}</a>
          <a href={`mailto:${email}`}>{email}</a>
        </div>
      </header>

      <section className="hero section-frame">
        <div className="hero-copy">
          <span className="eyebrow">Vercel-native full stack</span>
          <h1>Luxury-grade websites built to sell, schedule, and scale HVAC demand.</h1>
          <p className="lead-copy">
            This is not a template brochure. It is a revenue surface: a premium TSX frontend, server-side inquiry capture,
            live pipeline visibility, and deployment-ready infrastructure designed for operators who monetize trust.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#strategy-brief">
              Start the strategic brief
            </a>
            <a className="secondary-link" href="#command-center">
              Inspect the command center
            </a>
          </div>
        </div>

        <div className="hero-panel" id="command-center">
          <div className="panel-header">
            <span className="eyebrow">Live operator signal</span>
            <span className={`status-pill ${dashboard.storage}`}>{dashboard.storage.replace("-", " ")}</span>
          </div>
          <div className="dashboard-grid">
            <div className="metric-card feature-large">
              <span>Tracked inquiries</span>
              <strong>{dashboard.totalTracked.toString().padStart(2, "0")}</strong>
              <p>Visible to the server-rendered homepage and JSON API instantly.</p>
            </div>
            <div className="metric-card">
              <span>This week</span>
              <strong>{dashboard.thisWeek.toString().padStart(2, "0")}</strong>
            </div>
            <div className="metric-card">
              <span>Stack</span>
              <strong>Next.js</strong>
            </div>
          </div>
          <div className="pipeline-list">
            {dashboard.latest.length > 0 ? (
              dashboard.latest.map((record) => (
                <article className="pipeline-row" key={record.id}>
                  <div>
                    <strong>{record.company}</strong>
                    <span>{record.projectType}</span>
                  </div>
                  <div>
                    <span>{record.budgetBand}</span>
                    <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <strong>No inquiries yet.</strong>
                <span>Submit the form below locally or connect Vercel Blob before launch.</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="signal-band section-frame">
        {operatingSignals.map((signal) => (
          <article className="signal-card" key={signal.label}>
            <span className="eyebrow">{signal.label}</span>
            <strong>{signal.value}</strong>
            <p>{signal.detail}</p>
          </article>
        ))}
      </section>

      <section className="split-layout section-frame">
        <div className="section-copy">
          <span className="eyebrow">What this system covers</span>
          <h2>A premium front office that turns expensive traffic into booked revenue.</h2>
          <p>
            Non-technical operators get a refined commercial surface, while the backend remains clean: typed routes, validated
            server handlers, durable inquiry capture, and a deploy target built for Vercel from day one.
          </p>
        </div>
        <div className="service-stack">
          {signatureServices.map((service, index) => (
            <article className="service-card" key={service.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{service.title}</h3>
                <p>{service.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="blueprint section-frame">
        <div className="section-copy compact">
          <span className="eyebrow">Delivery sequence</span>
          <h2>Built for operators who need executive clarity, not engineering babysitting.</h2>
        </div>
        <div className="timeline-grid">
          {deliverySequence.map((step, index) => (
            <article className="timeline-card" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="brief-section section-frame" id="strategy-brief">
        <div className="section-copy form-intro">
          <span className="eyebrow">Strategic intake</span>
          <h2>Submit a commercial brief and capture it directly in the backend.</h2>
          <p>
            The form below is fully wired. Locally it stores into a JSON ledger for testing. In production, the same route persists
            directly into Vercel Blob without changing the frontend.
          </p>
        </div>
        <div className="form-shell">
          <ContactForm />
        </div>
      </section>

      <section className="footer-cta section-frame">
        <div>
          <span className="eyebrow">Deployment ready</span>
          <h2>Ship the same codebase to Vercel and keep the premium polish intact.</h2>
        </div>
        <div className="footer-actions">
          <a className="secondary-link" href="/api/health">
            Check API health
          </a>
          <a className="secondary-link" href="/api/readiness">
            Inspect deployment readiness
          </a>
          <a className="primary-button" href="/ops">
            Open operator desk
          </a>
        </div>
      </section>
    </main>
  );
}
