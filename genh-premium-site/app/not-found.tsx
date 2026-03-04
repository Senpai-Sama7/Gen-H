import Link from "next/link";

export default function NotFound() {
  return (
    <main className="site-shell" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <section className="section-frame" style={{ borderRadius: 28, padding: 32, width: "min(680px, 100%)" }}>
        <span className="eyebrow">404</span>
        <h1 style={{ fontSize: "clamp(3rem, 10vw, 5rem)", marginBottom: 12 }}>This route does not exist.</h1>
        <p className="lead-copy" style={{ marginTop: 0 }}>
          The requested page is outside the active revenue system. Return to the homepage and continue from the main command
          surface.
        </p>
        <div className="hero-actions">
          <Link className="primary-button" href="/">
            Return home
          </Link>
          <Link className="secondary-link" href="/api/health">
            API health
          </Link>
        </div>
      </section>
    </main>
  );
}
