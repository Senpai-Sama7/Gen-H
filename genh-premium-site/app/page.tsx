import { ContactForm } from "@/components/contact-form";
import { RevenueVisualizer } from "@/components/revenue-visualizer";
import { getInquiryDashboard } from "@/lib/inquiries";

export const dynamic = "force-dynamic";

const workflow = [
  {
    title: "Clarify the offer",
    body: "Make the value obvious in seconds so premium buyers understand what is different, what it costs, and why they should trust it."
  },
  {
    title: "Capture strong leads",
    body: "Collect intent, budget, timing, and commercial context through one structured brief instead of vague contact requests."
  },
  {
    title: "Run the pipeline",
    body: "Use the private admin portal to review every lead, qualify it, assign next actions, and track what is already booked."
  }
];

const controlPoints = [
  {
    label: "Clear public experience",
    detail: "A landing page that explains the offer without forcing visitors to decode jargon or guess what happens next."
  },
  {
    label: "Interactive signal view",
    detail: "A visualizer that shows how the funnel moves from first impression to booked work in a way non-technical buyers understand."
  },
  {
    label: "Private admin portal",
    detail: "A login-first dashboard where you control lead statuses, notes, and queue prioritization behind a secure session."
  }
];

export default async function HomePage() {
  const dashboard = await getInquiryDashboard();
  const phone = process.env.COMPANY_PHONE || "(555) 014-8891";
  const email = process.env.COMPANY_EMAIL || "advisors@genh.studio";

  return (
    <main className="site-shell landing-shell">
      <header className="site-nav glass-panel">
        <div className="brand-lockup">
          <span className="brand-kicker">GEN-H</span>
          <span className="brand-copy">Premium HVAC growth systems</span>
        </div>
        <nav className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#strategy-brief">Start brief</a>
          <a className="secondary-link" href="/portal">
            Admin login
          </a>
        </nav>
      </header>

      <section className="hero-layout">
        <div className="hero-main glass-panel">
          <span className="eyebrow">Clear offer. Clear action.</span>
          <h1>Premium websites and a real control room for the leads they create.</h1>
          <p className="hero-lead">
            This site is built to be obvious for non-technical buyers: a polished public-facing experience that explains the offer,
            captures the right information, and routes every inquiry into a private admin portal you can actually use.
          </p>
          <div className="hero-action-row">
            <a className="primary-button" href="#strategy-brief">
              Start the strategy brief
            </a>
            <a className="secondary-link" href="/portal">
              Open admin portal
            </a>
          </div>
          <div className="hero-contact-strip">
            <a href={`tel:${phone}`}>{phone}</a>
            <span />
            <a href={`mailto:${email}`}>{email}</a>
          </div>
        </div>

        <div className="hero-side glass-panel">
          <RevenueVisualizer
            trackedCount={dashboard.totalTracked}
            thisWeek={dashboard.thisWeek}
            latestCompanies={dashboard.latest.map((record) => record.company)}
          />
        </div>
      </section>

      <section className="clarity-section glass-panel" id="how-it-works">
        <div className="section-heading">
          <span className="eyebrow">What this does</span>
          <h2>One public experience, one private workflow, no confusion.</h2>
          <p>
            The site is designed to be understood quickly. A prospect sees what you offer, submits a structured brief, and your team
            handles the lead inside a secure admin portal instead of scattered inboxes and disconnected notes.
          </p>
        </div>

        <div className="feature-grid">
          {workflow.map((item, index) => (
            <article className="feature-card" key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="explain-grid">
        <div className="story-card glass-panel">
          <span className="eyebrow">Designed for clarity</span>
          <h2>No abstract agency language. Just a visible system.</h2>
          <p>
            The layout is intentionally simple: explain the offer, show the operating model, capture the lead, and give the operator a
            clean place to act on it.
          </p>
        </div>
        <div className="control-grid">
          {controlPoints.map((point) => (
            <article className="control-card glass-panel" key={point.label}>
              <strong>{point.label}</strong>
              <p>{point.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="brief-layout" id="strategy-brief">
        <div className="brief-copy glass-panel">
          <span className="eyebrow">Start here</span>
          <h2>Submit one brief. The backend does the rest.</h2>
          <p>
            The form is fully connected to the live backend. In production it writes directly to Vercel Blob and makes the inquiry
            available to the admin portal immediately.
          </p>
          <div className="brief-note-grid">
            <div>
              <strong>What the form captures</strong>
              <span>Name, company, contact details, project type, budget, launch timing, and the actual business bottleneck.</span>
            </div>
            <div>
              <strong>What you get after submission</strong>
              <span>A stored lead, a reference ID, and immediate visibility inside the private dashboard.</span>
            </div>
          </div>
        </div>

        <div className="brief-card glass-panel">
          <ContactForm />
        </div>
      </section>

      <footer className="site-footer glass-panel">
        <div>
          <span className="eyebrow">Operating links</span>
          <h2>Everything important is one click away.</h2>
        </div>
        <div className="footer-link-row">
          <a className="secondary-link" href="/api/health">
            API health
          </a>
          <a className="secondary-link" href="/api/readiness">
            Readiness report
          </a>
          <a className="primary-button" href="/portal">
            Admin portal login
          </a>
        </div>
      </footer>
    </main>
  );
}
