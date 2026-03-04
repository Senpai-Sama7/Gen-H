"use client";

import Link from "next/link";

const footerLinks = {
  product: [
    { href: "#funnel", label: "How it works" },
    { href: "#brief", label: "Start brief" },
    { href: "/portal", label: "Admin login" },
  ],
  legal: [
    { href: "#", label: "Privacy policy" },
    { href: "#", label: "Terms of service" },
  ],
};

export function Footer() {
  return (
    <footer className="relative bg-surface border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-semibold tracking-tight">
                GEN-H{" "}
                <span className="text-primary font-normal text-text-secondary">
                  Studio
                </span>
              </span>
            </Link>
            <p className="text-text-secondary max-w-md mb-6">
              Premium HVAC growth systems with integrated lead qualification.
              Clear offer. Clear action. Clear results.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="/api/health"
                className="text-sm text-text-muted hover:text-text-secondary transition-colors"
              >
                API health
              </a>
              <span className="w-1 h-1 rounded-full bg-text-muted" />
              <a
                href="/api/readiness"
                className="text-sm text-text-muted hover:text-text-secondary transition-colors"
              >
                Readiness report
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5">
          <p className="text-sm text-text-muted text-center">
            &copy; {new Date().getFullYear()} GEN-H Studio. Built for HVAC growth.
          </p>
        </div>
      </div>
    </footer>
  );
}
